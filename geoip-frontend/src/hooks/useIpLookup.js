import { useState, useEffect } from 'react';
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
    if (location && location.geoname_id) {
      loadSecondaryLocationData();
    }
  }, [language, location?.geoname_id]);

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

  const searchLocation = async () => {
    setIsLoading(true);
    setError('');
    
    if (!validateIp(ip)) {
      setError('Invalid IP address: ' + ip);
      setIsLoading(false);
      return false;
    }

    try {
      const data = await fetchLocationData(ip);
      
      if (data && data.length > 0) {
        // Successfull fetch
        setLocation(data[0]);

        // Load secondary location data
        loadSecondaryLocationData();
        
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

  const loadSecondaryLocationData = async () => {
    if (!location?.geoname_id) return;
    
    try {
      const data = await fetchSecondaryLocationData(
        location.geoname_id,
        language
      );
      
      if (data && data.length > 0) {
        setLocation(prevLocation => ({ ...prevLocation, ...data[0] }));
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
