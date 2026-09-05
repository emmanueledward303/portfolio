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
          href="https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&family=Source+Sans+3:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
