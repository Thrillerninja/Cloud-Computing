import { Box, Typography } from "@mui/material";
import React from 'react';

const LocationInfo = ({ location, error }) => {
  return (
    <Box>
      {error && (
        <Typography color="error">{error}</Typography>
      )}
      {location ? (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h5">Location Information</Typography>
          <Typography>Closest Host: {location.network || 'N/A'}</Typography>
          <Typography>City: {location.city_name || 'N/A'}</Typography>
          <Typography>Region: {location.subdivision_1_name || 'N/A'}</Typography>
          <Typography>Country: {location.country_name || 'N/A'}</Typography>
          <Typography>Latitude: {location.latitude || 'N/A'}</Typography>
          <Typography>Longitude: {location.longitude || 'N/A'}</Typography>
        </Box>
      ): (
        <Box sx={{ mt: 2, height: '180px' }}></Box>
      )}
      {!error && ( 
        <Box sx={{ mt: 2, height: '16px' }}></Box>
      )}
    </Box>
  );
};

export default LocationInfo;
