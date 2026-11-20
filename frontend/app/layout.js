import '@fontsource/playfair-display/500.css';
import '@fontsource/playfair-display/600.css';
import '@fontsource/playfair-display/700.css';
import '@fontsource/poppins/400.css';
import '@fontsource/poppins/500.css';
import '@fontsource/poppins/600.css';
import '@fontsource/poppins/700.css';
import '@fontsource/caveat/400.css';
import '@fontsource/caveat/600.css';
import './globals.css';
import { ThemeProvider, themeScript } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'Blush Planner — Event Calendar',
  description: 'A pretty pink weekly planner and event calendar.',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#e2557f',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
