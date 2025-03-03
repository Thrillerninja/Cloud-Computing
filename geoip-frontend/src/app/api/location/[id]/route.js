import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URI,
});

export async function GET(req, { params }) {
  const { id } = params;
  const { lang } = req.query;

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM locations WHERE geoname_id = $1 AND lang = $2', [id, lang]);
    client.release();

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ message: 'No city data found for this geoname ID' }), { status: 404 });
    }

    return new Response(JSON.stringify(result.rows), { status: 200 });
  } catch (err) {
    console.error('Error fetching from database:', err);
    return new Response(JSON.stringify({ message: `Failed to fetch data from database: ${err.message}` }), { status: 500 });
  }
}