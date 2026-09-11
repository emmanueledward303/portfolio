'use client';

import React, { useState } from 'react';
import styles from './Contact.module.css';

type Status = 'idle' | 'sending' | 'success' | 'error';

function EmailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  );
}

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setErrorMsg('Please fill out all fields before submitting.');
      setStatus('error');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      setErrorMsg('Please provide a valid email address.');
      setStatus('error');
      return;
    }

    setStatus('sending');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
        }),
      });

      let data: any = null;
      try {
        data = await res.json();
      } catch {
        // Non-JSON response from server/proxy
      }

      if (!res.ok) {
        setErrorMsg(data?.error || 'Failed to deliver message. Please try again or contact directly via email.');
        setStatus('error');
        return;
      }

      setStatus('success');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setErrorMsg('Network error — please try again.');
      setStatus('error');
    }
  };

  return (
    <section id="contact" className={styles.section} aria-labelledby="contact-heading">
      <div className="container">
        <div className={styles.inner}>

          {/* Left — info */}
          <div className={styles.info}>
            <p className={styles.eyebrow}>Contact</p>
            <h2 id="contact-heading" className={styles.heading}>
              Let&apos;s work<br />together
            </h2>
            <p className={styles.body}>
              Open to the right opportunity whether it&apos;s a data role, a full-stack
              project, or a conversation about either. I respond within 24 hours.
            </p>

            {/* Direct email display */}
            <a
              href="mailto:emmanueledward303@gmail.com"
              className={styles.emailDisplay}
              aria-label="Send email to emmanueledward303@gmail.com"
            >
              <EmailIcon />
              <span>emmanueledward303@gmail.com</span>
            </a>

            {/* Social links */}
            <div className={styles.socials}>
              <a
                href="https://www.linkedin.com/in/emmanuel-edward-nchekubechukwu-0a38052b4"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="LinkedIn profile"
              >
                <LinkedInIcon />
                LinkedIn
              </a>
              <a
                href="https://github.com/emmanueledward303"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialLink}
                aria-label="GitHub profile"
              >
                <GitHubIcon />
                GitHub
              </a>
            </div>
          </div>

          {/* Right — form */}
          <div className={styles.formWrap}>
            {status === 'success' ? (
              <div className={styles.successCard} role="alert">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
                  <circle cx="24" cy="24" r="23" stroke="var(--color-brown)" strokeWidth="2" />
                  <path d="M14 24l8 8 12-14" stroke="var(--color-brown)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <h3 className={styles.successTitle}>Message sent!</h3>
                <p className={styles.successBody}>
                  Thanks for reaching out — I&apos;ll get back to you within 24 hours.
                </p>
                <button
                  className="btn btn-outline"
                  onClick={() => setStatus('idle')}
                >
                  Send another
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className={styles.form} noValidate>
                <div className={styles.row}>
                  <div className={styles.field}>
                    <label htmlFor="contact-name" className={styles.label}>Name</label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Your name"
                      className={styles.input}
                      value={form.name}
                      onChange={handleChange}
                      disabled={status === 'sending'}
                    />
                  </div>
                  <div className={styles.field}>
                    <label htmlFor="contact-email" className={styles.label}>Email</label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      placeholder="your@email.com"
                      className={styles.input}
                      value={form.email}
                      onChange={handleChange}
                      disabled={status === 'sending'}
                    />
                  </div>
                </div>

                <div className={styles.field}>
                  <label htmlFor="contact-message" className={styles.label}>Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={6}
                    placeholder="Tell me about the opportunity or project..."
                    className={styles.textarea}
                    value={form.message}
                    onChange={handleChange}
                    disabled={status === 'sending'}
                  />
                </div>

                {status === 'error' && (
                  <p className={styles.errorMsg} role="alert">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  className={`btn btn-primary ${styles.submitBtn}`}
                  disabled={status === 'sending'}
                >
                  <SendIcon />
                  {status === 'sending' ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}
