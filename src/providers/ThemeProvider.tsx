import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    actualTheme: 'light' | 'dark'; // The resolved theme (after system preference)
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        // Try to load theme from localStorage
        const stored = localStorage.getItem('trustwork-theme') as Theme;
        return stored || 'system';
    });

    const [actualTheme, setActualTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove existing theme classes
        root.classList.remove('light', 'dark');

        let resolvedTheme: 'light' | 'dark';

        if (theme === 'system') {
            // Use system preference
            const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light';
            resolvedTheme = systemTheme;
        } else {
            resolvedTheme = theme;
        }

        // Apply the resolved theme
        root.classList.add(resolvedTheme);
        setActualTheme(resolvedTheme);

        // Listen for system theme changes when theme is set to 'system'
        if (theme === 'system') {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const handleChange = (e: MediaQueryListEvent) => {
                const newTheme = e.matches ? 'dark' : 'light';
                root.classList.remove('light', 'dark');
                root.classList.add(newTheme);
                setActualTheme(newTheme);
            };

            mediaQuery.addEventListener('change', handleChange);
            return () => mediaQuery.removeEventListener('change', handleChange);
        }
    }, [theme]);

    const value = {
        theme,
        actualTheme,
        setTheme: (newTheme: Theme) => {
            localStorage.setItem('trustwork-theme', newTheme);
            setTheme(newTheme);
        },
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
}
