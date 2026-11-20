'use client';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  return (
    <button
      className="theme-toggle"
      onClick={toggle}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <Moon size={13} className="ico moon" />
      <Sun size={13} className="ico sun" />
      <span className="knob">{theme === 'dark' ? <Moon size={13} /> : <Sun size={13} />}</span>
    </button>
  );
}
