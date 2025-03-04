import { useState, useEffect, use } from 'react';
import { validateIp } from '@/utils/ipValidation';
import {
  fetchLocationData,
  fetchSecondaryLocationData,
} from '@/services/locationService';

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
      searchLocation();
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
    //Ensure searchIP is a string and not a event object
    if (searchIP && typeof searchIP === 'object') {
      searchIP = ip;
      console.log('replace searchIP with ip:', searchIP);
    }

    setIsLoading(true);
    setError('');
    console.log('Searching location for IP:', searchIP
    );
    
    if (!validateIp(searchIP)) {
      setError('Invalid IP address: ' + searchIP);
      setIsLoading(false);
      return false;
    }

    try {
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
        return false;
      }
      
    } catch (err) {
      console.error('Failed to fetch location data:', err);
      setError(err.message || 'Failed to fetch data.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const loadSecondaryLocationData = async (geonameId) => {
    
    try {
      const data = await fetchSecondaryLocationData(
        geonameId,
        language
      );
      
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
