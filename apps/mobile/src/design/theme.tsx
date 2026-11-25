import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from 'react';
import type { ReactNode } from 'react';
import { Appearance } from 'react-native';
import { Colors, type ColorScheme, type ColorTokens } from './tokens';

interface ThemeContextType {
  theme: ColorScheme;
  colors: ColorTokens;
  toggleTheme: () => void;
  setTheme: (theme: ColorScheme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export { ThemeContext };

function resolveSystemTheme(): 'light' | 'dark' {
  try {
    const scheme = Appearance.getColorScheme?.();
    return scheme === 'light' ? 'light' : 'dark';
  } catch {
    return 'dark';
  }
}

export function ThemeProvider({
  children,
  initialTheme = 'system',
}: {
  children: ReactNode;
  initialTheme?: ColorScheme;
}) {
  const [theme, setThemeState] = useState<ColorScheme>(initialTheme);
  const [resolved, setResolved] = useState<'light' | 'dark'>(() => {
    if (initialTheme === 'system') return resolveSystemTheme();
    return initialTheme === 'light' ? 'light' : 'dark';
  });

  const colors = useMemo(() => Colors[resolved], [resolved]);

  useEffect(() => {
    let subscription: { remove?: () => void } | undefined;
    try {
      const appearance = Appearance as unknown as {
        addEventListener?: (
          event: string,
          handler: (info: { colorScheme: 'light' | 'dark' | null }) => void
        ) => { remove: () => void };
      };
      if (typeof appearance.addEventListener === 'function') {
        subscription = appearance.addEventListener('change', () => {
          if (theme === 'system') {
            const next = resolveSystemTheme();
            setResolved(next);
          }
        });
      }
    } catch {}
    return () => {
      try {
        subscription?.remove?.();
      } catch {}
    };
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev: ColorScheme) => {
      if (prev === 'light') return 'dark';
      if (prev === 'dark') return 'system';
      return 'light';
    });
  }, []);

  const setTheme = useCallback((newTheme: ColorScheme) => {
    setThemeState(newTheme);
    if (newTheme === 'system') {
      setResolved(resolveSystemTheme());
    } else {
      setResolved(newTheme === 'light' ? 'light' : 'dark');
    }
  }, []);

  useEffect(() => {
    if (theme !== 'system') {
      setResolved(theme === 'light' ? 'light' : 'dark');
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}

export function useColors() {
  return useTheme().colors;
}

export function useThemeName() {
  return useTheme().theme;
}

export function useThemeToggle() {
  return useTheme().toggleTheme;
}

export function useThemeSet() {
  return useTheme().setTheme;
}
