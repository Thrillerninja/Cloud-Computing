import { useState, useEffect } from 'react';

export default function usePreferences() {
  const [language, setLanguage] = useState('en');
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
  };

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  return {
    language,
    theme,
    handleLanguageChange,
    handleThemeChange,
  };
}
