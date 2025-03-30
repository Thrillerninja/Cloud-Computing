import { useState, useEffect } from 'react';
import { validateIp } from '@/utils/ipValidation';
import { fetchLocationData, fetchSecondaryLocationData } from '@/services/locationService';

let ipSearchCounter, errorCounter, searchDurationHistogram, uniqueIpCounter, uniqueIps;

if (typeof window === 'undefined') {
  // Import metrics only on the server
  ({ ipSearchCounter, errorCounter, searchDurationHistogram, uniqueIpCounter, uniqueIps } = require('@/app/api/metrics/route'));
}

export default function useIpLookup(language) {
  const [ip, setIp] = useState('');
  const [location, setLocation] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      initializeUserIp();
    }
  }, []);

  useEffect(() => {
    // Update location if language changes
    if (location && ip) {
      searchLocation(ip); // Ensure searchLocation is called with the current IP
    }
  }, [language]);

  const initializeUserIp = async () => {
    try {
      const userIp = await fetchUserIp();
      setIp(userIp);
      await searchLocation(userIp);
    } catch (err) {
      console.error('Failed to initialize IP:', err);
      setError(err.message);
    }
  };

  const fetchUserIp = async () => {
    try {
      const response = await fetch('/api/getUserIp');
      if (!response.ok) {
        throw new Error(response.statusText);
      }
      const data = await response.json();
      return data.ip;
    } catch (err) {
      console.error('Failed to fetch user IP:', err);
      setError('Failed to fetch user IP.');
      return '';
    }
  };

  const searchLocation = async (searchIP) => {
    // Ensure searchIP is a string and not an event object
    if (searchIP && typeof searchIP === 'object') {
      searchIP = ip;
      console.log('replace searchIP with ip:', searchIP);
    }

    searchIP = searchIP.trim(); // Trim leading/trailing spaces
    setIsLoading(true);
    setError('');
    console.log('Searching location for IP:', searchIP);

    if (!validateIp(searchIP)) {
      setError('Invalid IP address: ' + searchIP);
      if (typeof window === 'undefined') {
        errorCounter?.inc(); // Increment error counter
      }
      setIsLoading(false);
      return false;
    }

    const startTime = Date.now(); // Start timing the search
    try {
      if (typeof window === 'undefined') {
        ipSearchCounter?.inc(); // Increment IP search counter

        if (!uniqueIps?.has(searchIP)) {
          uniqueIps.add(searchIP);
          uniqueIpCounter?.inc(); // Increment unique IP counter
        }
      }

      const data = await fetchLocationData(searchIP);

      if (data && data.length > 0) {
        // Load secondary location data
        console.log('Fetched data');
        console.log(data);
        const locationData = await loadSecondaryLocationData(data[0].geoname_id);

        // One update to the state with combined data
        setLocation((prevLocation) => ({
          ...data[0],
          ...locationData,
        }));

        return true;
      } else {
        setError('No data found for this IP address.');
        if (typeof window === 'undefined') {
          errorCounter?.inc(); // Increment error counter
        }
        return false;
      }
    } catch (err) {
      console.error('Failed to fetch location data:', err);
      setError(err.message || 'Failed to fetch data.');
      if (typeof window === 'undefined') {
        errorCounter?.inc(); // Increment error counter
      }
      return false;
    } finally {
      const duration = (Date.now() - startTime) / 1000; // Calculate duration in seconds
      if (typeof window === 'undefined') {
        searchDurationHistogram?.observe(duration); // Record search duration
      }
      setIsLoading(false);
    }
  };

  const loadSecondaryLocationData = async (geonameId) => {
    try {
      const data = await fetchSecondaryLocationData(geonameId, language);

      if (data && data.length > 0) {
        return data[0];
      } else {
        setError('No city data found for this IP.');
      }
    } catch (err) {
      console.error('Failed to fetch secondary location data:', err);
      setError('Found network, failed to fetch location data.');
    }
  };

  return {
    ip,
    setIp,
    location,
    error,
    isLoading,
    searchLocation,
  };
}
