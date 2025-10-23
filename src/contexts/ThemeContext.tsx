import React, { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/clerk-react';
import { supabase } from '../utils/supabase';

type Theme = 'light' | 'dark' | 'auto';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isLoaded } = useUser();
  const [theme, setThemeState] = useState<Theme>('dark');
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('dark');

  const getSystemTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'dark';
  };

  const applyTheme = (themeToApply: Theme) => {
    const root = document.documentElement;
    let actualTheme: 'light' | 'dark' = 'dark';

    if (themeToApply === 'auto') {
      actualTheme = getSystemTheme();
    } else {
      actualTheme = themeToApply;
    }

    if (actualTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    setResolvedTheme(actualTheme);
  };

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('theme', newTheme);
    applyTheme(newTheme);

    if (user?.id) {
      try {
        const { data: existing } = await supabase
          .from('user_preferences')
          .select('id')
          .eq('user_id', user.id)
          .maybeSingle();

        if (existing) {
          await supabase
            .from('user_preferences')
            .update({
              theme_preference: newTheme,
              updated_at: new Date().toISOString()
            })
            .eq('user_id', user.id);
        } else {
          await supabase
            .from('user_preferences')
            .insert({
              user_id: user.id,
              theme_preference: newTheme
            });
        }
      } catch (error) {
        console.error('Failed to save theme preference:', error);
      }
    }
  };

  useEffect(() => {
    const loadTheme = async () => {
      let savedTheme: Theme | null = null;

      if (isLoaded && user?.id) {
        try {
          const { data } = await supabase
            .from('user_preferences')
            .select('theme_preference')
            .eq('user_id', user.id)
            .maybeSingle();

          if (data?.theme_preference) {
            savedTheme = data.theme_preference as Theme;
          }
        } catch (error) {
          console.error('Failed to load theme from database:', error);
        }
      }

      if (!savedTheme) {
        const localTheme = localStorage.getItem('theme') as Theme | null;
        savedTheme = localTheme || 'dark';
      }

      setThemeState(savedTheme);
      applyTheme(savedTheme);
    };

    loadTheme();
  }, [isLoaded, user?.id]);

  useEffect(() => {
    if (theme === 'auto') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        applyTheme('auto');
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
