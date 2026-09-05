'use client';

import React from 'react';
import styles from './Hero.module.css';

export default function Hero() {
  return (
    <section id="home" className={styles.hero} aria-label="Introduction">
      <div className={`container ${styles.inner}`}>
        {/* Copy */}
        <div className={styles.copy}>
          <p className={styles.greeting}>Hello, I&apos;m</p>
          <h1 className={styles.name}>Edward&nbsp;Emmanuel</h1>
          <p className={styles.tagline}>Aspiring Data Analyst &amp; Software Engineer</p>
          <p className={styles.intro}>
            I dig through spreadsheets and messy datasets until they tell me what's actually true,
            then ship the dashboard or app that puts it in front of people.
            Based in Nigeria, open to remote and hybrid work worldwide.
          </p>
          <div className={styles.actions}>
            <a href="#projects" className="btn btn-primary">
              View Projects
            </a>
            <a href="#contact" className="btn btn-outline">
              Get in Touch
            </a>
          </div>
        </div>

        {/* Portrait */}
        <div className={styles.portrait}>
          <div className={styles.portraitAccent} />
          <div className={styles.portraitFrame}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/profile.jpg"
              alt="Edward Emmanuel - Aspiring Data Analyst & Software Engineer"
              className={styles.portraitImg}
              width={340}
              height={400}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
