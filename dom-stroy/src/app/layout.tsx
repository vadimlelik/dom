import type { Metadata } from 'next';
import '@fontsource-variable/onest';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Строй дом', template: '%s' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru-BY">
      <body>{children}</body>
    </html>
  );
}
