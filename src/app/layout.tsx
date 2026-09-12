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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          id="theme-init"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');var d=t||(window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.setAttribute('data-theme',d);}catch(e){}})();`,
          }}
        />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;1,14..32,400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* Skip navigation — WCAG 2.4.1 Bypass Blocks */}
        <a href="#main-content" className="skip-to-content">
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
