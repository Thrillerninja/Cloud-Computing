import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.POSTGRES_URI,
});

export async function GET(req, { params }) {
  const { ip } = params;

  if (!ip) {
    return NextResponse.json({ message: 'IP address is required.' }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    const result = await client.query('SELECT * FROM locations WHERE ip = $1', [ip]);
    client.release();

    if (result.rows.length === 0) {
      return new Response(JSON.stringify({ message: 'No data found for this IP address' }), { status: 404 });
    }

    return new Response(JSON.stringify(result.rows), { status: 200 });
  } catch (err) {
    console.error('Error fetching from database:', err);
    return new Response(JSON.stringify({ message: `Failed to fetch data from database: ${err.message}` }), { status: 500 });
  }
}