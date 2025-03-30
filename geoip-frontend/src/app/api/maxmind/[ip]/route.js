import { NextResponse } from 'next/server';

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

  console.log('Received request to fetch data from MaxMind API', { ip });

  try {
    const response = await withTimeout(
      fetch(`https://geolite.info/geoip/v2.1/city/${ip}`, {
        headers: {
          Authorization: `Basic ${Buffer.from(
            process.env.MAXMIND_USER_ID + ':' + process.env.MAXMIND_LICENSE_KEY
          ).toString('base64')}`,
        },
      }),
      5000,
      'MaxMind API request timeout'
    );

    console.log('Response status:', response.status);
    console.log('Response statusText:', response.statusText);
    console.log('Response headers:', response.headers);

    if (!response.ok) {
      const errorData = await response.json();
      let errorMessage = `Failed to fetch data from MaxMind API: ${errorData.error}`;

      switch (errorData.code) {
        case 'IP_ADDRESS_INVALID':
          errorMessage = 'The supplied IP address is invalid.';
          break;
        case 'IP_ADDRESS_RESERVED':
          errorMessage = 'The supplied IP address belongs to a reserved or private range.';
          break;
        case 'IP_ADDRESS_NOT_FOUND':
          errorMessage = 'The supplied IP address is not in the database.';
          break;
        default:
          errorMessage = `Failed to fetch data from MaxMind API: ${errorData.error}`;
      }

      return new Response(JSON.stringify({ message: errorMessage }), {
        status: response.status,
      });
    }

    const data = await response.json();
    console.log('Data fetched from Maxmind:', data);
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    console.error('Error fetching from MaxMind:', err);
    return new Response(
      JSON.stringify({ message: `Failed to fetch data from MaxMind API: ${err.message}` }),
      { status: 500 }
    );
  }
}