import { NextResponse } from 'next/server';
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

export async function GET(req, { params }) {
  const { id } = await params;
  const url = new URL(req.url);
  const lang = url.searchParams.get('lang');

  if (!id || !lang) {
    return NextResponse.json({ message: 'ID and language are required.' }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM geoip_location WHERE geoname_id = $1 AND locale_code = $2', [id, lang]);
    client.release();

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ message: 'No data found for this ID and language in the database' }), { status: 404 });
    }

    return new Response(JSON.stringify(result.rows), { status: 200 });
  } catch (err) {
    console.error('Error fetching from database:', err);
    return new Response(JSON.stringify({ message: `Failed to fetch data from database: ${err.message}` }), { status: 500 });
  }
}