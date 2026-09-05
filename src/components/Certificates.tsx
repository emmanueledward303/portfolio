'use client';

import React, { useEffect, useState } from 'react';
import styles from './Certificates.module.css';

interface Certificate {
  id: string;
  title: string;
  issuer: string;
  issue_date: string;
  description: string;
}

function CertIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect x="2" y="2" width="24" height="24" rx="4" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="14" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 22c0-3.866 3.134-7 7-7s7 3.134 7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Certificates() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/certificates')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setCertificates(data);
        }
      })
      .catch((err) => console.error('Failed to load certificates:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="certificates" className={styles.section} aria-label="Certificates">
      <div className="container">
        <div className={styles.header}>
          <p className={styles.eyebrow}>Achievements</p>
          <h2 className={styles.heading}>Certificates Showcase</h2>
          <p className={styles.subheading}>
            Professional certifications earned across cloud infrastructure, data engineering,
            and full-stack development over the past four years.
          </p>
        </div>

        {loading ? (
          <div className={styles.grid} role="status" aria-label="Loading certificates">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className={`${styles.card} ${styles.skeletonCard}`}>
                <div className="skeleton" style={{ width: '32px', height: '32px', marginBottom: '12px' }} />
                <div className="skeleton" style={{ width: '80px', height: '14px', marginBottom: '8px' }} />
                <div className="skeleton" style={{ width: '70%', height: '22px', marginBottom: '8px' }} />
                <div className="skeleton" style={{ width: '50%', height: '16px', marginBottom: '12px' }} />
                <div className="skeleton" style={{ width: '100%', height: '48px' }} />
              </div>
            ))}
          </div>
        ) : (
          <ul className={styles.grid} role="list">
            {certificates.map((cert) => (
              <li key={cert.id} className={`${styles.card} card-tab`} aria-label={cert.title}>
                <div className={styles.cardIcon} aria-hidden="true">
                  <CertIcon />
                </div>
                <p className={styles.cardDate}>{cert.issue_date}</p>
                <h3 className={styles.cardTitle}>{cert.title}</h3>
                <p className={styles.cardIssuer}>{cert.issuer}</p>
                <p className={styles.cardDesc}>{cert.description}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
