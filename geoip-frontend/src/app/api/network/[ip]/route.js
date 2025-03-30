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

const withTimeout = (promise, timeoutMs, errorMessage) => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs)
    ),
  ]);
};

export async function GET(req, { params }) {
  const { ip } = await params;

  console.log('Received request to fetch data from the database', { ip });

  if (!ip) {
    return NextResponse.json({ message: 'IP address is required.' }, { status: 400 });
  }

  try {
    const client = await withTimeout(
      pool.connect(),
      5000,
      'Database connection timeout'
    );

    try {
      // Check if IP is in the database
      const result = await withTimeout(
        client.query('SELECT * FROM geoip_ip_mapping WHERE ip = $1', [ip]),
        5000,
        'Database query timeout for IP mapping'
      );

      if (result.rows.length === 0) {
        return new Response(
          JSON.stringify({ message: 'No saved data found for this IP address in the database' }),
          { status: 404 }
        );
      } else if (result.rows.length > 1) {
        return new Response(
          JSON.stringify({ message: 'Multiple entries found for this IP address in the database' }),
          { status: 500 }
        );
      }

      const network = result.rows[0].network;

      // Get network info from geoip_network table
      const networkResult = await withTimeout(
        client.query('SELECT * FROM geoip_network WHERE network = $1', [network]),
        5000,
        'Database query timeout for network info'
      );

      if (networkResult.rows.length === 0) {
        return new Response(
          JSON.stringify({ message: 'No saved data found for this IP address in the database' }),
          { status: 404 }
        );
      }

      return new Response(JSON.stringify(networkResult.rows), { status: 200 });
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Error fetching from database:', err);
    return new Response(
      JSON.stringify({ message: `Failed to fetch data from database: ${err.message}` }),
      { status: 500 }
    );
  }
}