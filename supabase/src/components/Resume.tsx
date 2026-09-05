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

function UploadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 12V4M9 4L6 7M9 4l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 13v1a2 2 0 002 2h8a2 2 0 002-2v-1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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

export default function Resume() {
  const [meta, setMeta] = useState<ResumeMeta>({
    file_url: '/resume.pdf',
    file_name: 'Edward_Emmanuel_Resume.pdf',
    last_updated: 'Oct 17, 2023',
  });
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setErrorMessage('Please select a valid PDF file.');
      return;
    }

    setUploading(true);
    setUploadSuccess(false);
    setErrorMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      setMeta({
        file_url: result.file_url || '/resume.pdf',
        file_name: result.file_name || file.name,
        last_updated: result.last_updated,
      });
      setUploadSuccess(true);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to upload resume.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <section id="resume" className={styles.section} aria-label="Resume">
      <div className="container">
        <div className={styles.header}>
          <p className={styles.eyebrow}>Resume</p>
          <h2 className={styles.heading}>Curriculum Vitae</h2>
          <p className={styles.subheading}>
            Download my current resume or inspect the live preview below. Always kept up to date.
          </p>
        </div>

        <div className={styles.card}>
          {/* Resume preview */}
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
              <p className={styles.metaLabel}>Current File</p>
              <p style={{ fontSize: '0.875rem', color: '#5a5550' }}>{meta.file_name}</p>

              <div className={styles.metaValue} style={{ marginTop: '8px' }}>
                <span>Last updated {meta.last_updated}</span>
                <span className={`${styles.successBadge} ${uploadSuccess ? styles.successVisible : ''}`} aria-live="polite">
                  <CheckIcon />
                  {uploadSuccess ? 'Replaced successfully' : 'Current version'}
                </span>
              </div>
            </div>

            {uploading && (
              <p className={styles.uploadingMsg} aria-live="polite" role="status">
                Uploading and updating resume...
              </p>
            )}

            {errorMessage && (
              <p style={{ color: 'var(--color-error)', fontSize: '0.875rem' }} role="alert">
                {errorMessage}
              </p>
            )}

            <div className={styles.actions}>
              <a
                href={meta.file_url}
                download={meta.file_name}
                className="btn btn-outline"
                aria-label="Download resume PDF"
              >
                Download PDF
              </a>

              <label
                className={`btn btn-primary ${styles.uploadLabel}`}
                htmlFor="resume-upload"
                aria-label="Upload or replace resume"
              >
                <UploadIcon />
                {uploading ? 'Uploading...' : 'Upload / Replace'}
                <input
                  id="resume-upload"
                  type="file"
                  accept="application/pdf"
                  className={styles.fileInput}
                  onChange={handleUpload}
                  disabled={uploading}
                  aria-label="Upload PDF resume"
                />
              </label>
            </div>

            {uploadSuccess && (
              <p className={styles.successMsg} role="status" aria-live="polite">
                Resume replaced. The new version is now live.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
