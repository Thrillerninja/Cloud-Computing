import React, { useState } from 'react';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Flag from 'react-world-flags';
import LightbulbCircleIcon from '@mui/icons-material/LightbulbCircle';

const languages = [
  { value: 'en', flag: 'US' },
  { value: 'fr', flag: 'FR' },
  { value: 'de', flag: 'DE' },
  { value: 'es', flag: 'ES' },
];

const themes = [
  { value: 'dark', color: 'black', back_color: 'white' },
  { value: 'light', color: 'white', back_color: 'black' },
  { value: 'blue', color: 'blue', back_color: 'yellow' },
  { value: 'green', color: 'green', back_color: 'red' },
];

const PreferenceSelector = ({ onLanguageChange, selectedLanguage, setTheme, theme }) => {


  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '80px' }}>
      <Select
        value={selectedLanguage}
        onChange={handleLanguageChange}
        displayEmpty
        variant="standard"
        inputProps={{
          style: { color: 'var(--color-text)' },
        }}
      >
        {languages.map((language) => (
          <MenuItem key={language.value} value={language.value}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Flag code={language.flag} style={{ width: 20, height: 15, marginRight: 10 }} />
              {language.flag}
            </div>
          </MenuItem>
        ))}
      </Select>
      <Select
        value={selectedTheme}
        onChange={handleThemeChange}
        displayEmpty
        size='small'
        variant="standard"
      >
        {themes.map((theme) => (
          <MenuItem key={theme.value} value={theme.value}>
            <LightbulbCircleIcon style={{ color: theme.color, background: theme.back_color, borderRadius: 15 }} />
          </MenuItem>
        ))}
      </Select>
    </div>
  );
};

export default PreferenceSelector;