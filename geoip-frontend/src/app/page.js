"use client";
import { useState, useEffect } from "react";
import { TextField, Button, Typography, Box, Paper } from "@mui/material";
import dynamic from "next/dynamic";
import PreferenceSelector from "@/components/PreferenceSelector";
import React from 'react';
import { isIP } from 'is-ip';

// Dynamically import LeafletMap to ensure it only runs on the client side
const LeafletMap = dynamic(() => import("../components/Map"), { ssr: false });

export default function Home() {
  const [ip, setIp] = useState("");
  const [location, setLocation] = useState(null);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("en");
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetchUserIp();
    }
  }, []); // Run once on component mount
  
  const fetchUserIp = async () => {
    try {
      const response = await fetch('/api/getUserIp');
      if (!response.ok) {
        throw new Error(response.message);
      }
      const data = await response.json();

      // Store the IP address in the state
      const ipAddress = data.ip;
      console.log('User IP fetched:', ipAddress);
      setIp(ipAddress);

      // Search for the location of the IP address
      handleSearch(ipAddress);
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  const handleSearch = async () => {
    console.log('Searching for IP:', ip);

    // Validate the IP address
    if (!validateIp(ip)) {
      return;
    }

    // Reset the error message
    setError("");
    let data = null;
    try {
      // Fetch the network data
      const encodedIp = encodeURIComponent(ip);
      console.log('Encoded IP:', encodedIp);
      const response = await fetch(`/api/network/${encodedIp}`);

      if (!response.ok) {
        const errorText = await response.text();
        const errorData = JSON.parse(errorText);

        const errorMessage = errorData.message || response.statusText;
        throw new Error(errorMessage);
      }
      data = await response.json();
      console.log('Data fetched:', data);
      if (data.length > 0) {
        setLocation(data[0]);
      } else {
        // If no data found in the database, fetch from MaxMind API
        const maxMindData = await fetchFromMaxMind(ip);
        if (maxMindData) {
          setLocation(maxMindData);
          // Add the fetched data to the database
          await addToDatabase(maxMindData);
        } else {
          setError("No data found for this IP address.");
        }
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
      setError(err.message || "Failed to fetch data.");
    }

    if (data && data.geoname_id !== null) {
      secondary_location_search();
    }
  };

  const fetchFromMaxMind = async (ip) => {
    try {
      const response = await fetch(`/api/maxmind/${ip}`);
      if (!response.ok) {
        throw new Error('Failed to fetch data from MaxMind API');
      }
      const data = await response.json();
      return data;
    } catch (err) {
      console.error('Error fetching from MaxMind:', err);
      return null;
    }
  };

  const addToDatabase = async (data) => {
    try {
      const response = await fetch('/api/addToDatabase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error('Failed to add data to the database');
      }
      console.log('Data added to the database successfully');
    } catch (err) {
      console.error('Error adding to database:', err);
    }
  };

  const secondary_location_search = async () => {
    try {
      const encodedLang = encodeURIComponent(language);
      const response = await fetch (`api/location/${location.geoname_id}?lang=${encodedLang}`)
      const data = await response.json();
      console.log(data);
      if (data.length > 0) {
        setLocation(prevLocation => ({ ...prevLocation, ...data[0] }));
      } else {
        setError("No city data found for this IP.");
      }
    } catch (err) {
      console.error(err);
      setError("Found network, failed to fetch location data.");
    }
    console.log(location);
  }

  const validateIp = (value) => {
    if (!isIP(value)) {
      setError('Invalid IP address.');
      return true; // Return false when IP is invalid
    } else {
      setError('');
      return true;
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    if (location && location.geoname_id) {
      secondary_location_search(location.geoname_id, newLanguage);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: 4,
        backgroundColor: "var(--color-background)",
        minHeight: "100vh",
      }}
    >
      <Paper 
        elevation={20}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: 4,
          minHeight: "70vh",
          background: 'var(--color-primary)',
        }}
      >
        <Typography variant="h3" sx={{ marginBottom: 2, color: 'var(--color-text)', font: '' }}>
          IP Location Finder
        </Typography>
        
        
        <Box sx={{ textAlign: "center", maxWidth: 800, display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ mt: 4, flex: 1, mr: 2, width: 250, color: 'var(--color-text)' }}>
            <Box sx={{ textAlign: "center", display: "flex", justifyContent: "space-between", mb: 1}}>
              <TextField
                label="Enter IP Address"
                variant="outlined"
                fullWidth
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                size="small"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'var(--color-accent)',
                    },
                    '&:hover fieldset': {
                      borderColor: 'var(--color-accent)',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'var(--color-accent)',
                    },
                  },
                  '& .MuiInputLabel-root': {
                    color: 'var(--color-accent)',
                  },
                  '& .MuiInputLabel-root.Mui-focused': {
                    color: 'var(--color-accent)',
                  },
                }}
                slotProps={{
                  input: {
                    style: { color: 'var(--color-text)'},
                  },
                  inputLabel: {
                    style: { color: 'var(--color-accent)' },
                  },
                }}
              />
              <Button variant="contained" onClick={handleSearch} sx={{ marginLeft: 2, background: 'var(--color-secondary)', width: 150, fontSize: 16 }}>
                Search
              </Button>
            </Box>
            {error && <Typography color="error">{error}</Typography>}
            {location && (
              <Box sx={{ mt: 4 }}>
                <Typography variant="h5">Location Information</Typography>
                <Typography>IP Address: {location.network}</Typography>
                <Typography>City: {location.city}</Typography>
                <Typography>Region: {location.region_name}</Typography>
                <Typography>Country: {location.country_name}</Typography>
                <Typography>Latitude: {location.latitude}</Typography>
                <Typography>Longitude: {location.longitude}</Typography>
              </Box>
            )}

            {/* Auto grow box to place next item at bottom */}
            <Box sx={{ flexGrow: 1, height: '290px' }} />
            <PreferenceSelector onLanguageChange={handleLanguageChange} selectedLanguage={language} setTheme={setTheme} theme={theme} />
          </Box>  
          <Box sx={{ mt: 4, flex: 1, ml: 2, width: 800 }}>
          <LeafletMap latitude={location?.latitude} longitude={location?.longitude} />
          </Box>
        </Box>    
      </Paper>
    </Box>
  );
}