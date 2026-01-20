'use client';

import * as React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/components/ui/button';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [isAnimating, setIsAnimating] = React.useState(false);

  // Avoid hydration mismatch
  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleThemeChange = () => {
    setIsAnimating(true);
    setTheme(theme === 'dark' ? 'light' : 'dark');
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 800);
  };

  if (!mounted) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleThemeChange}
      aria-label="Toggle theme"
      className="relative overflow-hidden transition-all duration-300 hover:scale-110 active:scale-95"
    >
      <div className="relative h-4 w-4">
        <Sun
          className={`absolute inset-0 h-4 w-4 transition-all duration-700 ease-in-out ${
            theme === 'dark'
              ? 'rotate-0 scale-100 opacity-100'
              : 'rotate-180 scale-0 opacity-0'
          } ${isAnimating ? 'animate-pulse' : ''}`}
        />
        <Moon
          className={`absolute inset-0 h-4 w-4 transition-all duration-700 ease-in-out ${
            theme === 'dark'
              ? '-rotate-180 scale-0 opacity-0'
              : 'rotate-0 scale-100 opacity-100'
          } ${isAnimating ? 'animate-pulse' : ''}`}
        />
      </div>
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}

