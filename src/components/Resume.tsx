'use client';

import React, { useEffect, useState } from 'react';
import styles from './Resume.module.css';

interface ResumeMeta {
  file_url: string;
  file_name: string;
  last_updated: string;
}

function CheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 10l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function ExternalIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg width="40" height="52" viewBox="0 0 40 52" fill="none" aria-hidden="true">
      <rect x="1" y="1" width="38" height="50" rx="3" stroke="currentColor" strokeWidth="1.5" fill="var(--color-paper)" />
      <path d="M26 1v12h12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="8" y="20" width="24" height="1.5" rx="0.75" fill="currentColor" opacity="0.3" />
      <rect x="8" y="26" width="18" height="1.5" rx="0.75" fill="currentColor" opacity="0.3" />
      <rect x="8" y="32" width="20" height="1.5" rx="0.75" fill="currentColor" opacity="0.3" />
      <rect x="8" y="38" width="14" height="1.5" rx="0.75" fill="currentColor" opacity="0.3" />
    </svg>
  );
}

/** Format today's date as e.g. "Sep 8, 2026" — used as the fallback last_updated value. */
function todayLabel(): string {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date());
}

export default function Resume() {
  const [meta, setMeta] = useState<ResumeMeta>({
    file_url: '/resume.pdf',
    file_name: 'Edward_Emmanuel_Resume.pdf',
    last_updated: todayLabel(),
  });

  useEffect(() => {
    let isMounted = true;
    fetch('/api/resume/upload')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data && data.last_updated) {
          setMeta(data);
        }
      })
      .catch((err) => console.error('Failed to load resume meta:', err));

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section id="resume" className={styles.section} aria-label="Resume">
      <div className="container">
        <div className={styles.header}>
          <p className={styles.eyebrow}>Resume</p>
          <h2 className={styles.heading}>Curriculum Vitae</h2>
          <p className={styles.subheading}>
            Download my current resume or inspect the live preview below. Always kept up to date with my latest production work.
          </p>
        </div>

        <div className={styles.card}>
          {/* Resume preview visual */}
          <div className={styles.previewCol}>
            <div className={styles.previewDoc} aria-label="Resume document preview" role="img">
              <div className={styles.previewIcon}>
                <FileIcon />
              </div>
              <div className={styles.previewLines} aria-hidden="true">
                <div className={styles.line} style={{ width: '80%' }} />
                <div className={styles.line} style={{ width: '60%' }} />
                <div className={styles.line} style={{ width: '70%' }} />
                <div className={styles.line} style={{ width: '50%' }} />
                <div className={styles.line} style={{ width: '75%' }} />
                <div className={styles.line} style={{ width: '40%' }} />
              </div>
            </div>
          </div>

          {/* Info + actions */}
          <div className={styles.infoCol}>
            <h3 className={styles.cardTitle}>Edward Emmanuel - Resume (PDF)</h3>

            <div className={styles.meta}>
              <p className={styles.metaLabel}>Current Document</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>{meta.file_name}</p>

              <div className={styles.metaValue} style={{ marginTop: '8px' }}>
                <span>Last updated {meta.last_updated}</span>
                <span className={`${styles.successBadge} ${styles.successVisible}`} aria-live="polite">
                  <CheckIcon />
                  Verified Active Version
                </span>
              </div>
            </div>

            <p style={{ color: 'var(--color-muted)', fontSize: '0.925rem', lineHeight: '1.6' }}>
              Comprehensive breakdown of my software engineering experience, data analytics workflows, production deliverables, and technical competencies.
            </p>

            <div className={styles.actions}>
              <a
                href={
                  meta.file_url
                    ? `${meta.file_url}${meta.file_url.includes('?') ? '&' : '?'}download=1`
                    : '/api/resume/download?download=1'
                }
                download={meta.file_name || 'Edward_Emmanuel_Resume.pdf'}
                className="btn btn-primary"
                aria-label="Download resume PDF"
              >
                <DownloadIcon />
                Download PDF
              </a>

              <a
                href={meta.file_url || '/api/resume/download'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline"
                aria-label="View resume in new tab"
              >
                <ExternalIcon />
                View Fullscreen
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
