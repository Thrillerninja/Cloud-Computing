"use client";
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
        <Typography variant="h3" sx={{ marginBottom: 2, color: 'var(--color-text)' }}>
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
            <Box sx={{ flexGrow: 1, height: '290px' }} />
            <PreferenceSelector 
              onLanguageChange={handleLanguageChange} 
              selectedLanguage={language} 
              setTheme={handleThemeChange} 
              theme={theme} 
            />
          </Box>  
          <Box sx={{ mt: 4, flex: 1, ml: 2, width: 800 }}>
            <LeafletMap latitude={location?.latitude} longitude={location?.longitude} />
          </Box>
        </Box>    
      </Paper>
    </Box>
  );
}
