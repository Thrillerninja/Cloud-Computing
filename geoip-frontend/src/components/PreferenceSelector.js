import React from 'react';
import { Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material';
import ReactWorldFlags from 'react-world-flags';

const PreferenceSelector = ({ onLanguageChange, selectedLanguage, setTheme, theme }) => {
  const handleLanguageChange = (event) => {
    const newLanguage = event.target.value;
    onLanguageChange(newLanguage);
  };

  const handleThemeChange = (event) => {
    const newTheme = event.target.value;
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const borderColor = 'var(--color-accent)';

  return (
    <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
      <FormControl
        sx={{
          minWidth: 120,
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'var(--color-background)',
            '& fieldset': { borderColor }
          },
          '& .MuiInputLabel-root': {
            color: 'var(--color-text)',
            transform: 'translate(0px,-18px) scale(0.8)'
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-accent)',
          },
          '& .MuiSvgIcon-root': {
            color: 'var(--color-text)',
          },
        }}
      >
        <InputLabel id="language-label">Language</InputLabel>
        <Select
          labelId="language-label"
          id="language-select"
          value={selectedLanguage}
          onChange={handleLanguageChange}
          sx={{
            color: 'var(--color-text)',
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text)',
              },
            },
          }}
        >
          <MenuItem value="en" sx={{ color: borderColor }}>
            <ReactWorldFlags code="us" style={{ width: 20, marginRight: 8 }} />
            English
          </MenuItem>
          <MenuItem value="de" sx={{ color: borderColor }}>
            <ReactWorldFlags code="de" style={{ width: 20, marginRight: 8 }} />
            German
          </MenuItem>
          <MenuItem value="es" sx={{ color: borderColor }}>
            <ReactWorldFlags code="es" style={{ width: 20, marginRight: 8 }} />
            Spanish
          </MenuItem>
          <MenuItem value="fr" sx={{ color: borderColor }}>
            <ReactWorldFlags code="fr" style={{ width: 20, marginRight: 8 }} />
            French
          </MenuItem>
        </Select>
      </FormControl>
      <FormControl
        sx={{
          minWidth: 120,
          ml: 2,
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'var(--color-background)',
            '& fieldset': { borderColor }
          },
          '& .MuiInputLabel-root': {
            color: 'var(--color-text)',
            transform: 'translate(0px,-18px) scale(0.8)'
          },
          '& .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--color-accent)',
          },
          '& .MuiSvgIcon-root': {
            color: 'var(--color-text)',
          },
        }}
      >
        <InputLabel id="theme-label">Theme</InputLabel>
        <Select
          labelId="theme-label"
          id="theme-select"
          value={theme}
          onChange={handleThemeChange}
          sx={{
            color: 'var(--color-text)',
          }}
          MenuProps={{
            PaperProps: {
              sx: {
                backgroundColor: 'var(--color-background)',
                color: 'var(--color-text)',
              },
            },
          }}
        >
          <MenuItem value="light" sx={{ color: borderColor }}>Light</MenuItem>
          <MenuItem value="dark" sx={{ color: borderColor }}>Dark</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default PreferenceSelector;