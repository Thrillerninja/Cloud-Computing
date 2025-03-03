import { NextResponse } from 'next/server';

export async function GET(req, { params }) {
  const { ip } = await params;

  try {
    const response = await fetch(`https://geolite.info/geoip/v2.1/city/${ip}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(process.env.MAXMIND_USER_ID + ':' + process.env.MAXMIND_LICENSE_KEY).toString('base64')}`
      }
    });

    console.log('Response status:', response.status);
    console.log('Response statusText:', response.statusText);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`MaxMind API error: ${errorText}`);
    }

    const data = await response.json();
    console.log('Data fetched from Maxmind:', data);
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error('Error fetching from MaxMind:', err);
    return new Response(JSON.stringify({ message: `Failed to fetch data from MaxMind API: ${err.message}` }), { status: 500 });
  }
}
