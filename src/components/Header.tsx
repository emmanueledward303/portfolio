'use client';

import React, { useState } from 'react';
import styles from './Header.module.css';

const NAV_LINKS = [
  { href: '#home',         label: 'Home' },
  { href: '#about',        label: 'About' },
  { href: '#projects',     label: 'Side Projects' },
  { href: '#tech-stack',   label: 'Tech Stack' },
  { href: '#resume',       label: 'Resume' },
  { href: '#contact',      label: 'Contact' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

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

        {/* Mobile hamburger */}
        <button
          className={styles.hamburger}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((prev) => !prev)}
        >
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen : ''}`} />
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen : ''}`} />
          <span className={`${styles.bar} ${menuOpen ? styles.barOpen : ''}`} />
        </button>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <nav className={styles.mobileNav} aria-label="Mobile navigation">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={styles.mobileLink}
              onClick={() => setMenuOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>
      )}
    </header>
  );
}
