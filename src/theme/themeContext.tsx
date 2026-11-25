import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import { ColorTokens, LIGHT_TOKENS, DARK_TOKENS } from './tokens';

export type ThemeMode = 'light' | 'dark';

interface ThemeContextValue {
  theme: ThemeMode;
  toggleTheme: () => void;
  setTheme: (mode: ThemeMode) => void;
  tokens: ColorTokens;
}

const THEME_STORAGE_KEY = 'zimm_theme_mode';

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
    if (saved === 'light' || saved === 'dark') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  });

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem(THEME_STORAGE_KEY, mode);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const tokens = useMemo(() => (theme === 'light' ? LIGHT_TOKENS : DARK_TOKENS), [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute('data-theme', theme);
    // Apply CSS variables for global styling
    Object.entries(tokens).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value);
    });
  }, [theme, tokens]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, tokens }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextValue => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
