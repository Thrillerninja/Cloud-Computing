import { NextResponse } from 'next/server';
import {
  ipSearchCounter,
  errorCounter,
  searchDurationHistogram,
  uniqueIpCounter,
  uniqueIps,
} from '@/app/api/metrics/route';

export async function POST(request) {
  try {
    const body = await request.json();
    const { type, value, ip } = body;

    if (!type || (type === 'searchDuration' && typeof value !== 'number')) {
      return NextResponse.json({ 
        message: 'Invalid request data. Ensure "type" and "value" are provided correctly.' 
      }, { status: 400 });
    }

    // Process metrics based on type
    if (type === 'ipSearch') {
      ipSearchCounter?.inc(); // Increment IP search counter
      if (ip && !uniqueIps?.has(ip)) {
        uniqueIps.add(ip);
        uniqueIpCounter?.inc(); // Increment unique IP counter
      }
    } else if (type === 'error') {
      const { category } = body;
      if (!category) {
        return NextResponse.json({ 
          message: 'Error category is required for error metrics.' 
        }, { status: 400 });
      }
      errorCounter?.inc({ category }); // Increment error counter with category
    } else if (type === 'searchDuration') {
      searchDurationHistogram?.observe(value); // Record search duration
    } else {
      return NextResponse.json({ 
        message: `Unsupported metric type: ${type}` 
      }, { status: 400 });
    }

    return NextResponse.json({ message: 'Metric updated successfully' });
  } catch (error) {
    console.error('Failed to update metrics:', error);
    return NextResponse.json({ 
      message: 'Failed to update metrics', 
      error: error.message 
    }, { status: 500 });
  }
}
