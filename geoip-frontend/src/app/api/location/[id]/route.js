import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

export async function GET(request, { params }) {
  const { id } = params;
  const { searchParams } = new URL(request.url);
  const lang = searchParams.get('lang');

  if (!id) {
    return NextResponse.json({ message: 'ID is required.' }, { status: 400 });
  }

  try {
    const client = await pool.connect();
    const query = "SELECT * FROM geoip_location WHERE geoname_id = $1 AND locale_code = $2";
    console.log('Query:', query, id, lang);
    const result = await client.query(query, [id, lang]);
    client.release();

    if (result.rows.length > 0) {
      return NextResponse.json(result.rows);
    } else {
      return NextResponse.json({ message: 'No data found for this GeoID.' }, { status: 404 });
    }
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: 'Failed to fetch data.' }, { status: 500 });
  }
}