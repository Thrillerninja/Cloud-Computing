import { useState, useEffect } from 'react';
import { validateIp } from '@/utils/ipValidation';
import { fetchLocationData, fetchSecondaryLocationData } from '@/services/locationService';

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
      updateMetrics('error', null, 'fetchUserIpError').catch(console.error);
      return '';
    }
  };

  const updateMetrics = async (type, value = null, ip = null) => {
    try {
      await fetch('/api/updateMetrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, value, ip }),
      });
    } catch (error) {
      console.error('Failed to update metrics:', error);
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
      updateMetrics('error', null, 'validationError').catch(console.error);
      setIsLoading(false);
      return false;
    }

    const startTime = Date.now(); // Start timing the search
    try {
      updateMetrics('ipSearch', null, searchIP); // Update IP search metric

      const data = await fetchLocationData(searchIP);

      if (data && data.length > 0 && data[0].geoname_id !== null) {
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
        updateMetrics('error', null, 'noDataFound').catch(console.error);
        return false;
      }
    } catch (err) {
      console.error('Failed to fetch location data:', err);
      setError(err.message || 'Failed to fetch data.');
      updateMetrics('error', null, 'fetchLocationError').catch(console.error);
      return false;
    } finally {
      const duration = (Date.now() - startTime) / 1000; // Calculate duration in seconds
      updateMetrics('searchDuration', duration).catch(console.error); // Update search duration metric
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
      updateMetrics('error', null, 'fetchSecondaryLocationError').catch(console.error);
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
