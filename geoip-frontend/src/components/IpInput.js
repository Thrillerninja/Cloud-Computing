import { TextField, Button, Box, CircularProgress } from "@mui/material";
import React from 'react';

const IpInput = ({ ip, setIp, handleSearch, error, isLoading }) => {
  return (
    <Box sx={{ textAlign: "center", display: "flex", justifyContent: "space-between", mb: 1 }}>
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
            style: { color: 'var(--color-text)' },
          },
          inputLabel: {
            style: { color: 'var(--color-accent)' },
          },
        }}
      />
      <Button variant="contained" onClick={handleSearch} sx={{ marginLeft: 2, background: 'var(--color-secondary)', width: 150, fontSize: 16 }}>
      {isLoading ? <CircularProgress size={24} /> : "Search"}
      </Button>
    </Box>
  );
};

export default IpInput;
