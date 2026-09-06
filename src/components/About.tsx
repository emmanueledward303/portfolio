'use client';

import React, { useEffect, useState } from 'react';
import styles from './About.module.css';

interface AboutFact {
  label: string;
  value: string;
}

interface AboutData {
  eyebrow?: string;
  heading: string;
  paragraphs: string[];
  facts: AboutFact[];
}

const DEFAULT_ABOUT: AboutData = {
  eyebrow: 'About Me',
  heading: 'Building at the intersection of data & code.',
  paragraphs: [
    "I'm Edward Emmanuel, self-taught data analyst and software engineer. I don't just clean datasets I turn them into dashboards, scoring models, and apps people open more than once.",
    "My background spans Python data pipelines, BI tools, Excel, SQL analytics and full-stack web development with React and Next.js. I care deeply about clear communication, honest metrics, and well-crafted interfaces.",
    "Off the keyboard, you'll find me gaming, watching movies, or lost in whatever internet rabbit hole caught me that week.",
  ],
  facts: [
    { label: 'Based in', value: 'Nigeria' },
    { label: 'Work preference', value: 'Remote & Hybrid' },
    { label: 'To opportunities', value: 'Open' },
  ],
};

export default function About() {
  const [data, setData] = useState<AboutData>(DEFAULT_ABOUT);

  useEffect(() => {
    const fetchAbout = () => {
      fetch('/api/about')
        .then((res) => res.json())
        .then((resData) => {
          if (resData && resData.heading) {
            setData(resData);
          }
        })
        .catch(() => {
          /* keep default data */
        });
    };

    fetchAbout();
    const interval = setInterval(fetchAbout, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="about" className={styles.about} aria-labelledby="about-heading">
      <div className={`container ${styles.inner}`}>
        {/* Left column: Headings, Highlights & Quick Facts */}
        <div className={styles.leftCol}>
          <p className={styles.eyebrow}>{data.eyebrow || 'About Me'}</p>
          <h2 id="about-heading" className={styles.heading}>
            {data.heading}
          </h2>

          <div className={styles.factsContainer}>
            <p className={styles.factsHeader}>Quick Overview</p>
            <ul className={styles.statsList} aria-label="Key highlights">
              {data.facts?.map((fact, index) => (
                <li key={index} className={styles.statCard}>
                  <span className={styles.statLabel}>{fact.label}</span>
                  <span className={styles.statValue}>{fact.value}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className={styles.actionRow}>
            <a href="#projects" className="btn btn-primary" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
              Explore Projects &rarr;
            </a>
            <a href="#contact" className="btn btn-outline" style={{ padding: '10px 20px', fontSize: '0.85rem' }}>
              Get In Touch
            </a>
          </div>
        </div>

        {/* Right column: Bio Story & Narrative */}
        <div className={styles.rightCol}>
          <div className={styles.bioCard}>
            <div className={styles.bioCardHeader}>
              <span className={styles.cardTag}>Professional Background</span>
            </div>
            <div className={styles.paragraphsList}>
              {data.paragraphs?.map((para, index) => (
                <p key={index} className={styles.body}>
                  {para}
                </p>
              ))}
            </div>

            <div className={styles.focusQuote}>
              <div className={styles.quoteBar} />
              <p className={styles.quoteText}>
                &ldquo;Clean pipelines, honest metrics, and web tools crafted for real impact.&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
