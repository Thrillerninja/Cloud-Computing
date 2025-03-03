import fetch from 'node-fetch';

export async function GET(req, { params }) {
  const { ip } = params;

  try {
    const response = await fetch(`https://geoip.maxmind.com/geoip/v2.1/city/${ip}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(process.env.MAXMIND_USER_ID + ':' + process.env.MAXMIND_LICENSE_KEY).toString('base64')}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch data from MaxMind API');
    }

    const data = await response.json();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error('Error fetching from MaxMind:', err);
    return new Response(JSON.stringify({ message: 'Failed to fetch data from MaxMind API' }), { status: 500 });
  }
}
