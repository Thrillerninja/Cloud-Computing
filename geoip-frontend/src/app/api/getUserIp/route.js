import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return NextResponse.json({ ip: data.ip }); // Ensure ip is a string
  } catch (error) {
    return NextResponse.json({ ip: '' }, { status: 500 });
  }
}