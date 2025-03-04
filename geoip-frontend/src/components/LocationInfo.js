import { Box, Typography } from "@mui/material";
import React from 'react';

const LocationInfo = ({ location, error }) => {
  return (
    <Box >
      {error && <Typography color="error">{error}</Typography>}
      {location && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h5">Location Information</Typography>
          <Typography>IP Address: {location.network}</Typography>
          <Typography>City: {location.city_name}</Typography>
          <Typography>Region: {location.subdivision_1_name}</Typography>
          <Typography>Country: {location.country_name}</Typography>
          <Typography>Latitude: {location.latitude}</Typography>
          <Typography>Longitude: {location.longitude}</Typography>
        </Box>
      )}
    </Box>
  );
};

export default LocationInfo;
