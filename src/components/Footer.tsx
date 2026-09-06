import React from 'react';
import Link from 'next/link';
import styles from './Footer.module.css';

const CONTACT_LINKS = [
  { label: 'Email', href: 'mailto:emmanueledward303@gmail.com' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/emmanuel-edward-nchekubechukwu-0a38052b4' },
  { label: 'GitHub', href: 'https://github.com/emmanueledward303' },
];

export default function Footer() {
  return (
    <footer className={styles.footer} role="contentinfo">
      <div className={`container ${styles.footerInner}`}>
        {/* Left */}
        <div className={styles.footerLeft}>
          <span className={styles.footerName}>Edward Emmanuel</span>
          <span className={styles.footerRole}>&nbsp;Aspiring Data Analyst &amp; Software Engineer</span>
        </div>

        {/* Right: contact links */}
        <nav aria-label="Footer navigation">
          <ul className={styles.footerLinks} role="list">
            {CONTACT_LINKS.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className={styles.footerLink}
                  target={link.href.startsWith('http') ? '_blank' : undefined}
                  rel={link.href.startsWith('http') ? 'noopener noreferrer' : undefined}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Legal */}
      <div className={`container ${styles.legalRow}`}>
        <p className={styles.legal}>
          &copy; {new Date().getFullYear()} Edward Emmanuel. All rights reserved.
        </p>
        <div className={styles.legalRight}>
          <Link href="/privacy" className={styles.privacyLink}>Privacy Policy</Link>
        </div>
      </div>
    </footer>
  );
}
