import { renderHook, act } from '@testing-library/react'; // Updated imports
import usePreferences from '../usePreferences';

describe('usePreferences Hook', () => {
  test('initializes with default values', () => {
    const { result } = renderHook(() => usePreferences());
    expect(result.current.language).toBe('en');
    expect(result.current.theme).toBe('light');
  });

  test('changes language', () => {
    const { result } = renderHook(() => usePreferences());
    act(() => {
      result.current.handleLanguageChange('de');
    });
    expect(result.current.language).toBe('de');
  });

  test('changes theme', () => {
    const { result } = renderHook(() => usePreferences());
    act(() => {
      result.current.handleThemeChange('dark');
    });
    expect(result.current.theme).toBe('dark');
  });
});
