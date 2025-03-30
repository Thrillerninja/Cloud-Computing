import { NextResponse } from 'next/server';

let client, register, ipSearchCounter, sessionDurationGauge, errorCounter, searchDurationHistogram, uniqueIpCounter, activeSessionsGauge, uniqueIps;
let sessionStartTime = Date.now(); // Declare globally to ensure accessibility

if (typeof window === 'undefined') {
  try {
    // Import prom-client only on the server
    client = require('prom-client');
    register = new client.Registry();
    client.collectDefaultMetrics({ register });

    // Custom metrics
    ipSearchCounter = new client.Counter({
      name: 'ip_search_count',
      help: 'Number of IPs searched in the current session',
    });

    sessionDurationGauge = new client.Gauge({
      name: 'session_duration_seconds',
      help: 'Time active in seconds for the current session',
    });

    errorCounter = new client.Counter({
      name: 'ip_search_error_count',
      help: 'Number of errors encountered during IP searches',
    });

    searchDurationHistogram = new client.Histogram({
      name: 'ip_search_duration_seconds',
      help: 'Histogram of IP search durations in seconds',
      buckets: [0.01, 0.05, 0.1, 0.2, 0.5, 1], // Adjusted buckets for faster requests
    });

    uniqueIpCounter = new client.Counter({
      name: 'unique_ip_search_count',
      help: 'Number of unique IPs searched in the current session',
    });

    activeSessionsGauge = new client.Gauge({
      name: 'active_sessions',
      help: 'Number of active sessions',
    });

    register.registerMetric(ipSearchCounter);
    register.registerMetric(sessionDurationGauge);
    register.registerMetric(errorCounter);
    register.registerMetric(searchDurationHistogram);
    register.registerMetric(uniqueIpCounter);
    register.registerMetric(activeSessionsGauge);

    uniqueIps = new Set();
    activeSessionsGauge.inc(); // Increment active sessions on server start
  } catch (error) {
    console.error('Failed to initialize metrics:', error);
  }
}

export async function GET() {
  if (typeof window !== 'undefined') {
    return NextResponse.json({ message: 'Metrics are only available on the server' }, { status: 400 });
  }

  try {
    // Update session duration
    const now = Date.now();
    sessionDurationGauge.set((now - sessionStartTime) / 1000);

    const metrics = await register.metrics();
    return new Response(metrics, {
      status: 200,
      headers: { 'Content-Type': register.contentType },
    });
  } catch (error) {
    console.error('Failed to fetch metrics:', error);
    return NextResponse.json({ message: 'Failed to fetch metrics', error: error.message }, { status: 500 });
  }
}

// Export metrics for use in other parts of the app
export {
  ipSearchCounter,
  sessionDurationGauge,
  errorCounter,
  searchDurationHistogram,
  uniqueIpCounter,
  activeSessionsGauge,
  uniqueIps,
};
