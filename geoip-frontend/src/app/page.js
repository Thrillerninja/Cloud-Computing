"use client";
import { useState, useEffect } from "react";
import { Box, Paper, Typography } from "@mui/material";
import dynamic from "next/dynamic";
import PreferenceSelector from "@/components/PreferenceSelector";
import IpInput from "@/components/IpInput";
import LocationInfo from "@/components/LocationInfo";
import useIpLookup from "@/hooks/useIpLookup";
import usePreferences from "@/hooks/usePreferences";

// Dynamically import LeafletMap to ensure it only runs on the client side
const LeafletMap = dynamic(() => import("@/components/Map"), { ssr: false });

export default function Home() {
  const { language, theme, handleLanguageChange, handleThemeChange } = usePreferences();
  const { ip, setIp, location, error, isLoading, searchLocation } = useIpLookup(language);
  const [markers, setMarkers] = useState([]);
  const [visitedGeonameIds, setVisitedGeonameIds] = useState(new Set());
  const [instanceId, setInstanceId] = useState('');

  useEffect(() => {
    fetch('/instance_id.txt')
      .then(response => response.text())
      .then(data => setInstanceId(data.trim()));
  }, []);

  // Update markers based on new location data
  useEffect(() => {
    console.log('location:', location);
    if (location && !visitedGeonameIds.has(location.geoname_id) ) {
      const newMarker = {
        lat: location.latitude,
        lng: location.longitude,
        status: "Active",
        popupData: {
          IP: ip,
          City: location.city_name,
          Country: location.country_name,
        },
      };

      setMarkers([...markers, newMarker]);
      setVisitedGeonameIds(new Set(visitedGeonameIds).add(location.geoname_id));
    }
  }, [location, ip, markers, visitedGeonameIds]);

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
          background: 'var(--color-primary)',
        }}
      >
        <Typography sx={{ marginBottom: 2, color: 'var(--color-text)', fontSize: '42px' }}>
          IP Location Finder
        </Typography>

        <Box sx={{ textAlign: "center", maxWidth: 800, display: "flex", justifyContent: "space-between" }}>
          <Box sx={{ mt: 4, flex: 1, mr: 2, width: 250, color: 'var(--color-text)' }}>
            <IpInput
              ip={ip}
              setIp={setIp}
              handleSearch={searchLocation}
              error={error}
              isLoading={isLoading}
            />
            <LocationInfo location={location} error={error} />
            <Box sx={{ flexGrow: 1, height: '78px' }} />
            <PreferenceSelector
              onLanguageChange={handleLanguageChange}
              selectedLanguage={language}
              setTheme={handleThemeChange}
              theme={theme}
            />
          </Box>
          <Box sx={{ mt: 4, flex: 1, ml: 2, width: 800 }}>
            <LeafletMap latitude={location?.latitude} longitude={location?.longitude} markers={markers} />
          </Box>
        </Box>
      </Paper>

      <Box sx={{ mt: 4, color: 'var(--color-text)', textAlign: 'center' }}>        
        <p>Instance ID: {instanceId}</p>  
        <Box sx={{fontSize: "10px", color: '#888888'}}>Provided by your favourite load balancer</Box>
      </Box>
    </Box>
  );
}
