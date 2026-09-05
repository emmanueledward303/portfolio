'use client';

import React, { useEffect, useState } from 'react';
import styles from './TechStack.module.css';

interface Skill {
  name: string;
}

interface TechCategory {
  id: string;
  name: string;
  slug: string;
  icon_name: string;
  skills: Skill[];
}

function FrontendIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="3" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 21h8M12 19v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9 10l2 2-2 2M13 14h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function BackendIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="2" width="20" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2" y="14" width="20" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="6" cy="6" r="1" fill="currentColor" />
      <circle cx="6" cy="18" r="1" fill="currentColor" />
    </svg>
  );
}

function DataIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse cx="12" cy="6" rx="8" ry="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 6v6c0 1.657 3.582 3 8 3s8-1.343 8-3V6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 12v6c0 1.657 3.582 3 8 3s8-1.343 8-3v-6" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function ToolsIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function getCategoryIcon(slug: string) {
  switch (slug) {
    case 'frontend': return <FrontendIcon />;
    case 'backend':  return <BackendIcon />;
    case 'data':     return <DataIcon />;
    case 'tools':    return <ToolsIcon />;
    default:         return <ToolsIcon />;
  }
}

export default function TechStack() {
  const [categories, setCategories] = useState<TechCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/tech-stack')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch((err) => console.error('Failed to load tech stack:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="tech-stack" className={styles.section} aria-label="Tech stack">
      <div className="container">
        <div className={styles.header}>
          <p className={styles.eyebrow}>Capabilities</p>
          <h2 className={styles.heading}>Categorized Tech Stack</h2>
          <p className={styles.subheading}>
            Tools and technologies I use professionally, organised by discipline.
          </p>
        </div>

        {loading ? (
          <div className={styles.grid} role="status" aria-label="Loading tech stack">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`${styles.card} ${styles.skeletonCard}`}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div className="skeleton" style={{ width: '24px', height: '24px', borderRadius: '4px' }} />
                  <div className="skeleton" style={{ width: '120px', height: '22px' }} />
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {[1, 2, 3, 4, 5, 6].map((chip) => (
                    <div key={chip} className="skeleton" style={{ width: '70px', height: '28px', borderRadius: '4px' }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.grid}>
            {categories.map((cat) => (
              <div key={cat.id} className={`${styles.card} card-tab`} aria-label={cat.name}>
                <div className={styles.cardHeader}>
                  <span className={styles.icon} aria-hidden="true">{getCategoryIcon(cat.slug)}</span>
                  <h3 className={styles.cardTitle}>{cat.name}</h3>
                </div>
                <ul className={styles.skills} role="list" aria-label={`${cat.name} skills`}>
                  {Array.isArray(cat.skills) && cat.skills.map((skill) => (
                    <li key={skill.name} className={styles.chip}>{skill.name}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
