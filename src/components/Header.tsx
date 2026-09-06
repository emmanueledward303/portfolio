'use client';

import React, { useState, useEffect } from 'react';
import styles from './Header.module.css';

const NAV_LINKS = [
  { href: '#home',         label: 'Home' },
  { href: '#about',        label: 'About' },
  { href: '#thoughts',     label: 'Thoughts & Notes' },
  { href: '#projects',     label: 'Side Projects' },
  { href: '#tech-stack',   label: 'Tech Stack' },
  { href: '#resume',       label: 'Resume' },
  { href: '#contact',      label: 'Contact' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Prevent background scroll when mobile drawer is open
  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  // Close drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <header className={styles.header} role="banner">
      <div className={`container ${styles.inner}`}>
        {/* Logo / Name */}
        <a href="#home" className={styles.logo} aria-label="Edward Emmanuel - home">
          <span className={styles.logoMark}>EE</span>
          <span className={styles.logoName}>Edward Emmanuel</span>
        </a>

        {/* Desktop nav */}
        <nav className={styles.nav} aria-label="Primary navigation">
          {NAV_LINKS.map((link) => (
            <a key={link.href} href={link.href} className={styles.navLink}>
              {link.label}
            </a>
          ))}
        </nav>

        {/* Mobile hamburger button */}
        <button
          className={styles.hamburger}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          aria-controls="mobile-drawer"
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen : ''}`} />
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen : ''}`} />
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen : ''}`} />
        </button>
      </div>

      {/* Backdrop overlay */}
      <div
        className={`${styles.drawerBackdrop} ${menuOpen ? styles.backdropVisible : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Off-canvas slide-in drawer from the LEFT */}
      <aside
        id="mobile-drawer"
        className={`${styles.drawer} ${menuOpen ? styles.drawerOpen : ''}`}
        aria-label="Mobile navigation drawer"
        aria-hidden={!menuOpen}
        inert={!menuOpen}
      >
        <div className={styles.drawerHeader}>
          <div className={styles.drawerBrand}>
            <span className={styles.logoMark}>EE</span>
            <span className={styles.drawerTitle}>Edward Emmanuel</span>
          </div>
          <button
            className={styles.closeBtn}
            onClick={() => setMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <nav className={styles.drawerNav} aria-label="Mobile navigation links">
          {NAV_LINKS.map((link, index) => (
            <a
              key={link.href}
              href={link.href}
              className={styles.drawerLink}
              onClick={() => setMenuOpen(false)}
            >
              <span className={styles.drawerLinkIndex}>0{index + 1}</span>
              <span className={styles.drawerLinkLabel}>{link.label}</span>
            </a>
          ))}
        </nav>

        <div className={styles.drawerFooter}>
          <p className={styles.drawerFooterLabel}>Get in touch</p>
          <a href="mailto:emmanueledward303@gmail.com" className={styles.drawerFooterEmail}>
            emmanueledward303@gmail.com
          </a>
        </div>
      </aside>
    </header>
  );
}
