import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: String(process.env.DB_PASSWORD), // Ensure password is a string
  port: Number(process.env.DB_PORT), // Ensure port is a number
  ssl: {
    rejectUnauthorized: false, // Use this for Azure PostgreSQL Flexible Server
  },
});

const withTimeout = (promise, timeoutMs, errorMessage) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
};

export async function POST(req) {
  console.log('Received request to add data to the database');
  try {
    const client = await withTimeout(
      pool.connect(),
      5000,
      'Database connection timeout'
    );
    const data = await req.json();

    try {
      // Add IP mapping to geoip_ip_mapping table
      const ipQuery = `INSERT INTO geoip_ip_mapping (ip, network) VALUES ($1, $2) ON CONFLICT (ip) DO NOTHING`;
      const ipValues = [data.traits.ip_address, data.traits.network];
      await withTimeout(
        client.query(ipQuery, ipValues),
        5000,
        'Database query timeout for IP mapping'
      );

      // Add network info to geoip_network table
      const networkQuery = `
        INSERT INTO geoip_network (network, geoname_id, registered_country_geoname_id, represented_country_geoname_id, is_anonymous_proxy, is_satellite_provider, postal_code, latitude, longitude, accuracy_radius, is_anycast)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        ON CONFLICT (network) DO NOTHING
      `;
      const networkValues = [
        data.traits.network,
        data.city?.geoname_id || data.country?.geoname_id,
        data.registered_country?.geoname_id || null,
        data.country?.geoname_id || null,
        data.is_anonymous_proxy || null,
        data.is_satellite_provider || null,
        data.postal?.code || null,
        data.location?.latitude || null,
        data.location?.longitude || null,
        data.location?.accuracy_radius || null,
        data.is_anycast || null,
      ];
      await withTimeout(
        client.query(networkQuery, networkValues),
        5000,
        'Database query timeout for network info'
      );

      console.log('Network data added to the database');

      // Add location info to geoip_location table for each language
      const languages = ['de', 'en', 'es', 'fr', 'ja', 'pt-BR', 'ru', 'zh-CN'];
      for (const lang of languages) {
        console.log(`Adding location data for ${lang} to the database`);
        try {
          const locationQuery = `
          INSERT INTO geoip_location (geoname_id, locale_code, continent_name, country_name, subdivision_1_name, subdivision_2_name, city_name, time_zone, is_in_european_union)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
          ON CONFLICT (geoname_id, locale_code) DO NOTHING
          `;
          const locationValues = [
            data.city?.geoname_id || data.country?.geoname_id,
            lang,
            data.continent?.names[lang] || null,
            data.country?.names[lang] || null,
            data.subdivisions?.[0]?.names[lang] || null,
            data.subdivisions?.[1]?.names[lang] || null,
            data.city?.names[lang] || null,
            data.location?.time_zone || null,
            data.registered_country?.is_in_european_union || null,
          ];
          await withTimeout(
            client.query(locationQuery, locationValues),
            5000,
            `Database query timeout for location data (${lang})`
          );
        } catch (err) {
          console.error(`Error adding location data for ${lang}:`, err);
        }
      }
    } finally {
      client.release();
    }

    return new Response(
      JSON.stringify({ message: 'Data added to the database successfully' }),
      { status: 200 }
    );
  } catch (err) {
    console.error('Error adding to database:', err);
    return new Response(
      JSON.stringify({ message: `Failed to add data to the database: ${err.message}` }),
      { status: 500 }
    );
  }
}
