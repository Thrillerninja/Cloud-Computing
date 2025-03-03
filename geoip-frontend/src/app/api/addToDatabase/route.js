import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URI,
});

export async function POST(req) {
  try {
    const client = await pool.connect();
    const data = await req.json();
    const query = `
      INSERT INTO locations (ip, network, city, region_name, country_name, latitude, longitude, geoname_id, lang)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    `;
    const values = [
      data.ip,
      data.network,
      data.city,
      data.region_name,
      data.country_name,
      data.latitude,
      data.longitude,
      data.geoname_id,
      data.lang,
    ];
    await client.query(query, values);
    client.release();

    return new Response(JSON.stringify({ message: 'Data added to the database successfully' }), { status: 200 });
  } catch (err) {
    console.error('Error adding to database:', err);
    return new Response(JSON.stringify({ message: `Failed to add data to the database: ${err.message}` }), { status: 500 });
  }
}
