import { createContext, useState, useEffect, useContext } from 'react';

const ThemeContext = createContext();

const THEME_ORDER = ['dark', 'light', 'hachiware-dark', 'hachiware-light'];

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => {
      const idx = THEME_ORDER.indexOf(prev);
      return THEME_ORDER[(idx + 1) % THEME_ORDER.length];
    });
  };

  const isHachiware = theme.startsWith('hachiware');
  const isLight = theme === 'light' || theme === 'hachiware-light';

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, isHachiware, isLight }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
