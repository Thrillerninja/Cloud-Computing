import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const forwarded = request.headers.get('x-forwarded-for');
    let userIp = forwarded ? forwarded.split(',')[0].trim() : null;

    // Check if the IP is in IPv6-mapped IPv4 format and extract the IPv4 part
    if (userIp && userIp.startsWith('::ffff:')) {
      userIp = userIp.split('::ffff:')[1];
    }

    if (userIp) {
      return NextResponse.json({ ip: userIp });
    }

    // Fallback to external service if header is unavailable
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return NextResponse.json({ ip: data.ip });
  } catch (error) {
    console.error('Error fetching user IP:', error);
    fetch('/api/updateMetrics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'error', category: 'externalServiceError' }),
    }).catch(console.error);
    return NextResponse.json({ ip: '' }, { status: 500 });
  }
}