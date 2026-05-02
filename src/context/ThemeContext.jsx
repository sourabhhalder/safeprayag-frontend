import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('sp_theme');
    return saved ? saved === 'dark' : true; // default dark
  });

  useEffect(() => {
    localStorage.setItem('sp_theme', dark ? 'dark' : 'light');
    const root = document.documentElement;
    if (dark) {
      root.style.setProperty('--bg',       '#0D0D1A');
      root.style.setProperty('--bg-2',     '#12121F');
      root.style.setProperty('--bg-card',  '#181828');
      root.style.setProperty('--bg-card-2','#1E1E32');
      root.style.setProperty('--border',   'rgba(255,255,255,0.08)');
      root.style.setProperty('--text',     '#F0EFF8');
      root.style.setProperty('--text-2',   '#A0A0C0');
      root.style.setProperty('--text-muted','#5A5A78');
    } else {
      root.style.setProperty('--bg',       '#F4F6FB');
      root.style.setProperty('--bg-2',     '#E8ECF4');
      root.style.setProperty('--bg-card',  '#FFFFFF');
      root.style.setProperty('--bg-card-2','#F0F2F8');
      root.style.setProperty('--border',   'rgba(0,0,0,0.10)');
      root.style.setProperty('--text',     '#1A1A2E');
      root.style.setProperty('--text-2',   '#4A4A6A');
      root.style.setProperty('--text-muted','#8A8AAA');
    }
  }, [dark]);

  return (
    <ThemeContext.Provider value={{ dark, toggle: () => setDark(d => !d) }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
