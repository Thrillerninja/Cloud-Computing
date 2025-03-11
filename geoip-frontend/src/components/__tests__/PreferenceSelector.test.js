import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PreferenceSelector from '../PreferenceSelector';
import { act } from 'react';

test('renders language and theme selectors', () => {
  act(() => {
    render(<PreferenceSelector onLanguageChange={() => {}} selectedLanguage="en" setTheme={() => {}} theme="light" />);
  });
  const languageSelect = screen.getByRole('combobox', { name: /Language/i });
  const themeSelect = screen.getByRole('combobox', { name: /Theme/i });
  expect(languageSelect).toBeInTheDocument();
  expect(themeSelect).toBeInTheDocument();
});

test('calls onLanguageChange when language is changed', () => {
  const onLanguageChange = jest.fn();
  act(() => {
    render(<PreferenceSelector onLanguageChange={onLanguageChange} selectedLanguage="en" setTheme={() => {}} theme="light" />);
  });
  const languageSelect = screen.getByRole('combobox', { name: /Language/i });
  fireEvent.mouseDown(languageSelect);
  const languageOption = screen.getByRole('option', { name: /German/i });
  fireEvent.click(languageOption);
  expect(onLanguageChange).toHaveBeenCalledWith('de');
});

test('calls setTheme when theme is changed', () => {
  const setTheme = jest.fn();
  act(() => {
    render(<PreferenceSelector onLanguageChange={() => {}} selectedLanguage="en" setTheme={setTheme} theme="light" />);
  });
  const themeSelect = screen.getByRole('combobox', { name: /Theme/i });
  fireEvent.mouseDown(themeSelect);
  const themeOption = screen.getByRole('option', { name: /Dark/i });
  fireEvent.click(themeOption);
  expect(setTheme).toHaveBeenCalledWith('dark');
});
