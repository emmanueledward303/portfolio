import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Edward Emmanuel | Developer Portfolio',
  description:
    'Full-stack developer specialising in scalable web applications, data-driven systems, and clean product experiences. Based in Lagos, Nigeria.',
  keywords: ['developer', 'portfolio', 'full-stack', 'software engineer', 'Next.js', 'React'],
  openGraph: {
    title: 'Edward Emmanuel | Developer Portfolio',
    description:
      'Full-stack developer specialising in scalable web applications, data-driven systems, and clean product experiences.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=Inter:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
