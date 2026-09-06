import React from 'react';
import type { Metadata } from 'next';
import styles from './privacy.module.css';
import Breadcrumb from '@/components/Breadcrumb';

export const metadata: Metadata = {
  title: 'Privacy Policy — Edward Emmanuel',
  description:
    'Privacy Policy for the personal portfolio of Edward Emmanuel. Learn how this site collects and handles your data.',
};

const LAST_UPDATED = 'September 2026';

export default function PrivacyPage() {
  return (
    <main className={styles.page} id="main-content">
      <div className={`container ${styles.inner}`}>
        {/* Breadcrumb — WCAG 2.4.8 Location */}
        <Breadcrumb
          items={[
            { label: 'Home', href: '/' },
            { label: 'Privacy Policy' },
          ]}
        />

        {/* Page header */}
        <header className={styles.header} aria-labelledby="privacy-heading">
          <p className={styles.eyebrow}>Legal</p>
          <h1 id="privacy-heading" className={styles.heading}>Privacy Policy</h1>
          <p className={styles.meta}>Last updated: {LAST_UPDATED}</p>
        </header>

        <div className={styles.body}>
          {/* Intro */}
          <section className={styles.section} aria-labelledby="intro-heading">
            <h2 id="intro-heading" className={styles.sectionHeading}>Overview</h2>
            <p>
              Welcome to the personal portfolio website of <strong>Edward Emmanuel</strong> (the
              &quot;Site&quot;). This Privacy Policy explains what information is collected when you
              visit this Site, how it is used, and your rights in relation to it. Your privacy is
              respected here — this is a personal portfolio and does <strong>not</strong> collect,
              sell, or share personal data with third parties for advertising purposes.
            </p>
          </section>

          {/* Information Collected */}
          <section className={styles.section} aria-labelledby="collected-heading">
            <h2 id="collected-heading" className={styles.sectionHeading}>Information Collected</h2>
            <p>
              This Site is a static/server-rendered portfolio. It does <strong>not</strong> use
              cookies, tracking pixels, or advertising networks. The following minimal data may be
              processed:
            </p>
            <ul className={styles.list}>
              <li>
                <strong>Server logs:</strong> When you visit the Site, the hosting provider (Vercel
                or similar) may automatically log your IP address, browser type, referring URL, and
                the pages you visit. These logs are retained for a short period for security and
                performance diagnostics and are not used for personal profiling.
              </li>
              <li>
                <strong>Contact information:</strong> If you reach out via the email address listed
                on this Site, the content of your message and your email address will be received.
                This information is used solely to respond to your inquiry.
              </li>
              <li>
                <strong>Resume downloads:</strong> Clicking the &quot;Download Resume&quot; button
                initiates a direct file download. No personal data is captured from this action.
              </li>
            </ul>
          </section>

          {/* Use of Information */}
          <section className={styles.section} aria-labelledby="use-heading">
            <h2 id="use-heading" className={styles.sectionHeading}>How Information Is Used</h2>
            <p>Any information that reaches this Site or its owner is used exclusively to:</p>
            <ul className={styles.list}>
              <li>Respond to messages or inquiries sent directly via email.</li>
              <li>Monitor and improve the performance and security of the Site.</li>
              <li>Fulfil any professional or contractual obligations arising from direct contact.</li>
            </ul>
            <p>
              There is no automated decision-making, profiling, or use of your information for
              marketing purposes.
            </p>
          </section>

          {/* Third-Party Services */}
          <section className={styles.section} aria-labelledby="third-party-heading">
            <h2 id="third-party-heading" className={styles.sectionHeading}>Third-Party Services</h2>
            <p>
              This Site may link to external platforms such as GitHub, LinkedIn, and other services.
              When you click those links, you leave this Site and are subject to the privacy policies
              of the respective platform. This Site has no control over and accepts no responsibility
              for those policies.
            </p>
            <p>
              Hosting is provided by a third-party infrastructure provider (e.g. Vercel). Their
              privacy policy governs data processed at the infrastructure level.
            </p>
          </section>

          {/* Data Retention */}
          <section className={styles.section} aria-labelledby="retention-heading">
            <h2 id="retention-heading" className={styles.sectionHeading}>Data Retention</h2>
            <p>
              Email correspondence is retained only as long as necessary to manage the relevant
              professional relationship or inquiry. Server logs are retained for a short, rolling
              window as determined by the hosting provider.
            </p>
          </section>

          {/* Your Rights */}
          <section className={styles.section} aria-labelledby="rights-heading">
            <h2 id="rights-heading" className={styles.sectionHeading}>Your Rights</h2>
            <p>
              Depending on your location, you may have the right to access, correct, or request
              deletion of personal data held about you. To exercise any such right, please contact
              via the email address below. Requests will be responded to within a reasonable
              timeframe.
            </p>
          </section>

          {/* Changes */}
          <section className={styles.section} aria-labelledby="changes-heading">
            <h2 id="changes-heading" className={styles.sectionHeading}>Changes to This Policy</h2>
            <p>
              This Privacy Policy may be updated from time to time. The &quot;Last updated&quot;
              date at the top of this page will always reflect the most recent revision. Continued
              use of the Site after any changes constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact */}
          <section className={styles.section} aria-labelledby="contact-heading">
            <h2 id="contact-heading" className={styles.sectionHeading}>Contact</h2>
            <p>
              For any questions or concerns regarding this Privacy Policy, please get in touch:
            </p>
            <address className={styles.address}>
              <strong>Edward Emmanuel</strong>
              <br />
              Email:{' '}
              <a href="mailto:emmanueledward303@gmail.com" className={styles.link}>
                emmanueledward303@gmail.com
              </a>
            </address>
          </section>
        </div>

        {/* Back link */}
        <div className={styles.backRow}>
          <a href="/" className={`btn btn-outline ${styles.backBtn}`}>
            ← Back to Portfolio
          </a>
        </div>
      </div>
    </main>
  );
}
