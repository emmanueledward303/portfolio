import React from 'react';
import styles from './Footer.module.css';

const CONTACT_LINKS = [
  { label: 'Email', href: 'mailto:edward@example.com' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/edward-emmanuel' },
  { label: 'GitHub', href: 'https://github.com/edwardemmanuel' },
];

export default function Footer() {
  return (
    <>
      {/* Closing CTA Band */}
      <section id="contact" className={styles.cta} aria-label="Contact invitation">
        <div className={`container ${styles.ctaInner}`}>
          <div className={styles.ctaText}>
            <h2 className={styles.ctaHeading}>
              Open to the right opportunity.
            </h2>
            <p className={styles.ctaBody}>
              If you are building something meaningful and need a developer who can own
              a problem end-to-end, I would be glad to have that conversation.
            </p>
          </div>
          <a href="mailto:edward@example.com" className={`btn btn-primary ${styles.ctaBtn}`}>
            Contact
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer} role="contentinfo">
        <div className={`container ${styles.footerInner}`}>
          {/* Left */}
          <div className={styles.footerLeft}>
            <span className={styles.footerName}>Edward Emmanuel</span>
            <span className={styles.footerRole}>Full-Stack Developer / Data Engineer</span>
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
            &copy; {new Date().getFullYear()} Edward Emmanuel. All rights reserved. Built with Next.js.
          </p>
          <a href="#" className={styles.privacyLink}>Privacy Policy</a>
        </div>
      </footer>
    </>
  );
}
