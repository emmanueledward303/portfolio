import React from 'react';
import Image from 'next/image';
import styles from './About.module.css';

const HIGHLIGHTS = [
  '5 years shipping production software across fintech, logistics, and SaaS',
  'Led full-stack development on 3 products from 0 to 10,000+ active users',
  'Strong background in data engineering and system design',
  'Comfortable working across distributed, async-first teams',
];

export default function About() {
  return (
    <section id="about" className={styles.about} aria-label="About me">
      <div className={`container ${styles.inner}`}>
        {/* Photo */}
        <div className={styles.photoWrap}>
          <div className={styles.photoFrame}>
            <Image
              src="/about.jpg"
              alt="Edward Emmanuel working in studio"
              width={300}
              height={360}
              className={styles.photoImg}
            />
          </div>
        </div>

        {/* Text */}
        <div className={styles.content}>
          <p className={styles.eyebrow}>About Me</p>
          <h2 className={styles.heading}>
            Building things that work,<br />
            <em>and that people enjoy using.</em>
          </h2>

          <p className={styles.body}>
            I am a full-stack developer and data engineer based in Lagos, Nigeria. I have spent the last
            five years working at the intersection of product thinking and engineering rigour, building
            systems that need to perform reliably under real-world load. I care deeply about clean code,
            clear communication, and delivering software that does exactly what it promises.
          </p>

          <p className={styles.body}>
            Outside of engineering, I spend time mentoring early-career developers, contributing to open
            source, and writing about software architecture. I believe the best products are built by
            people who are as curious about the problem as they are skilled at the solution.
          </p>

          {/* Highlight list */}
          <ul className={styles.highlights} aria-label="Key highlights">
            {HIGHLIGHTS.map((item, i) => (
              <li key={i} className={styles.highlightItem}>
                <span className={styles.bullet} aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
