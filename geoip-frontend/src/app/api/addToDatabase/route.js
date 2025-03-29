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

export async function POST(req) {
  try {
    const client = await pool.connect();
    const data = await req.json();

    // Add IP mapping to geoip_ip_mapping table
    const ipQuery = `INSERT INTO geoip_ip_mapping (ip, network) VALUES ($1, $2) ON CONFLICT (ip) DO NOTHING`;
    const ipValues = [data.traits.ip_address, data.traits.network];
    await client.query(ipQuery, ipValues);

    // Add network info to geoip_network table
    const networkQuery = `
      INSERT INTO geoip_network (network, geoname_id, registered_country_geoname_id, represented_country_geoname_id, is_anonymous_proxy, is_satellite_provider, postal_code, latitude, longitude, accuracy_radius, is_anycast)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      ON CONFLICT (network) DO NOTHING
    `;
    const networkValues = [
      data.traits.network,                               // Has to exist
      data.city?.geoname_id || data.country?.geoname_id, // Has to exist
      data.registered_country?.geoname_id || null,
      data.country?.geoname_id || null,
      data.is_anonymous_proxy || null,    // This field is not present in the MaxMind data
      data.is_satellite_provider || null, // This field is not present in the MaxMind data
      data.postal?.code || null,
      data.location?.latitude || null,
      data.location?.longitude || null,
      data.location?.accuracy_radius || null,
      data.is_anycast || null,            // This field is not present in the MaxMind data
    ];
    await client.query(networkQuery, networkValues);

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
          data.city?.geoname_id || data.country?.geoname_id, // Has to exist
          lang,                                              // Has to exist
          data.continent?.names[lang] || null,
          data.country?.names[lang] || null,
          data.subdivisions?.[0]?.names[lang] || null,
          data.subdivisions?.[1]?.names[lang] || null,
          data.city?.names[lang] || null,
          data.location?.time_zone || null,
          data.registered_country?.is_in_european_union || null,
        ];
        await client.query(locationQuery, locationValues);
      } catch (err) {
        console.error('Error adding location data to the database:', err);
      }
    }

    client.release();

    return new Response(JSON.stringify({ message: 'Data added to the database successfully' }), { status: 200 });
  } catch (err) {
    console.error('Error adding to database:', err);
    return new Response(JSON.stringify({ message: `Failed to add data to the database: ${err.message}` }), { status: 500 });
  }
}
