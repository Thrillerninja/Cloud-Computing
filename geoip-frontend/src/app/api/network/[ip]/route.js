import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

export async function GET(request, context) {
  const { params } = context;
  const { ip } = await params; // Await params before destructuring
  
  if (!ip) {
    return NextResponse.json({ message: 'IP address is required.' }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    const query = 'SELECT * FROM geoip_network WHERE network = $1';
    console.log('Query:', query, ip);
    const result = await client.query(query, [ip]);
    client.release();

    if (result.rows.length > 0) {
      return NextResponse.json(result.rows);
    } else {
      return NextResponse.json({ message: 'No data found for this IP address.' }, { status: 404 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Failed to fetch data.' }, { status: 500 });
  }
}