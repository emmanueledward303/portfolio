'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './admin.module.css';

interface Project {
  id: string;
  title: string;
  tagline?: string;
  description: string;
  category: string;
  tech_stack: string[];
  demo_url?: string;
  github_url?: string;
  image_url?: string;
  featured?: boolean;
}

interface ResumeMeta {
  file_url: string;
  file_name: string;
  last_updated: string;
}

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  read_time: string;
  slug: string;
}

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Active tab: 'about' | 'projects' | 'blog' | 'resume' | 'storage' | 'overview'
  const [activeTab, setActiveTab] = useState<'about' | 'projects' | 'blog' | 'resume' | 'storage' | 'overview'>('projects');

  // About Me State
  interface AboutFact {
    label: string;
    value: string;
  }

  interface AboutState {
    eyebrow: string;
    heading: string;
    paragraphs: string[];
    facts: AboutFact[];
  }

  const [aboutData, setAboutData] = useState<AboutState>({
    eyebrow: 'About Me',
    heading: '',
    paragraphs: [''],
    facts: [
      { label: 'Based in', value: 'Nigeria' },
      { label: 'Work preference', value: 'Remote & Hybrid' },
      { label: 'To opportunities', value: 'Open' },
    ],
  });
  const [aboutLoading, setAboutLoading] = useState(false);
  const [aboutSaving, setAboutSaving] = useState(false);
  const [aboutSuccessMsg, setAboutSuccessMsg] = useState<string | null>(null);
  const [aboutErrorMsg, setAboutErrorMsg] = useState<string | null>(null);

  // GitHub Auto-Commit & Storage State
  interface GitHubStatus {
    configured: boolean;
    source: string | null;
    repo: string;
    branch: string;
    username?: string;
    canWrite?: boolean;
    error?: string;
  }

  const [githubStatus, setGithubStatus] = useState<GitHubStatus | null>(null);
  const [githubLoading, setGithubLoading] = useState(true);
  const [tokenInput, setTokenInput] = useState('');
  const [tokenSaving, setTokenSaving] = useState(false);
  const [tokenSuccessMsg, setTokenSuccessMsg] = useState<string | null>(null);
  const [tokenErrorMsg, setTokenErrorMsg] = useState<string | null>(null);

  // Projects state
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [projectSaving, setProjectSaving] = useState(false);
  const [projectSuccessMsg, setProjectSuccessMsg] = useState<string | null>(null);
  const [projectErrorMsg, setProjectErrorMsg] = useState<string | null>(null);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [deletingProjectId, setDeletingProjectId] = useState<string | null>(null);

  // New Project Form State
  const [newProject, setNewProject] = useState({
    title: '',
    tagline: '',
    category: 'Data Analytics',
    description: '',
    tech_stack: '',
    demo_url: '',
    github_url: '',
    featured: false,
  });

  // Resume state
  const [resumeMeta, setResumeMeta] = useState<ResumeMeta | null>(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [resumeSuccessMsg, setResumeSuccessMsg] = useState<string | null>(null);
  const [resumeErrorMsg, setResumeErrorMsg] = useState<string | null>(null);

  // Blog state
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [blogLoading, setBlogLoading] = useState(false);
  const [blogSaving, setBlogSaving] = useState(false);
  const [blogSuccessMsg, setBlogSuccessMsg] = useState<string | null>(null);
  const [blogErrorMsg, setBlogErrorMsg] = useState<string | null>(null);

  const [newPost, setNewPost] = useState({
    title: '',
    excerpt: '',
    content: '',
    read_time: '',
    date: '',
  });

  // 1. Check auth status on mount
  useEffect(() => {
    fetch('/api/admin/verify')
      .then((res) => res.json())
      .then((data) => {
        setIsAuthenticated(Boolean(data.authenticated));
      })
      .catch(() => setIsAuthenticated(false));
  }, []);

  // 2. Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadAbout();
      loadProjects();
      loadResume();
      loadBlogPosts();
      loadGitHubStatus();
    }
  }, [isAuthenticated]);

  const loadAbout = () => {
    setAboutLoading(true);
    fetch('/api/about')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.heading) {
          setAboutData({
            eyebrow: data.eyebrow || 'About Me',
            heading: data.heading || '',
            paragraphs: Array.isArray(data.paragraphs) && data.paragraphs.length > 0 ? data.paragraphs : [''],
            facts: Array.isArray(data.facts) && data.facts.length > 0 ? data.facts : [
              { label: 'Based in', value: 'Nigeria' },
              { label: 'Work preference', value: 'Remote & Hybrid' },
              { label: 'To opportunities', value: 'Open' },
            ],
          });
        }
      })
      .catch((err) => console.error('Error loading about data:', err))
      .finally(() => setAboutLoading(false));
  };

  const loadGitHubStatus = () => {
    setGithubLoading(true);
    fetch('/api/admin/github-token')
      .then((res) => res.json())
      .then((data) => {
        setGithubStatus(data);
      })
      .catch((err) => console.error('Error checking GitHub status:', err))
      .finally(() => setGithubLoading(false));
  };

  const loadProjects = () => {
    setProjectsLoading(true);
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProjects(data);
      })
      .catch((err) => console.error('Error loading projects:', err))
      .finally(() => setProjectsLoading(false));
  };

  const loadResume = () => {
    fetch('/api/resume/upload')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.last_updated) setResumeMeta(data);
      })
      .catch((err) => console.error('Error loading resume:', err));
  };

  const loadBlogPosts = () => {
    setBlogLoading(true);
    fetch('/api/blog')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setBlogPosts(data);
      })
      .catch((err) => console.error('Error loading blog posts:', err))
      .finally(() => setBlogLoading(false));
  };

  // Handlers: Save About Me Profile
  const handleSaveAbout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aboutData.heading.trim()) {
      setAboutErrorMsg('A headline/heading is required.');
      return;
    }
    const validParagraphs = aboutData.paragraphs.map((p) => p.trim()).filter(Boolean);
    if (validParagraphs.length === 0) {
      setAboutErrorMsg('Please provide at least one bio paragraph.');
      return;
    }

    setAboutSaving(true);
    setAboutSuccessMsg(null);
    setAboutErrorMsg(null);

    try {
      const res = await fetch('/api/about', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eyebrow: aboutData.eyebrow,
          heading: aboutData.heading,
          paragraphs: validParagraphs,
          facts: aboutData.facts,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update About Me');
      }
      setAboutSuccessMsg('About Me profile successfully updated and committed to your portfolio!');
      loadAbout();
    } catch (err: any) {
      setAboutErrorMsg(err.message || 'Error saving About Me');
    } finally {
      setAboutSaving(false);
    }
  };

  const handleParagraphChange = (index: number, val: string) => {
    setAboutData((prev) => {
      const next = [...prev.paragraphs];
      next[index] = val;
      return { ...prev, paragraphs: next };
    });
  };

  const handleAddParagraph = () => {
    setAboutData((prev) => ({ ...prev, paragraphs: [...prev.paragraphs, ''] }));
  };

  const handleRemoveParagraph = (index: number) => {
    setAboutData((prev) => {
      if (prev.paragraphs.length <= 1) return prev;
      return { ...prev, paragraphs: prev.paragraphs.filter((_, i) => i !== index) };
    });
  };

  const handleFactChange = (index: number, field: 'label' | 'value', val: string) => {
    setAboutData((prev) => {
      const next = [...prev.facts];
      next[index] = { ...next[index], [field]: val };
      return { ...prev, facts: next };
    });
  };

  // Handlers: Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordInput) return;

    setAuthLoading(true);
    setAuthError(null);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed');
      }

      setIsAuthenticated(true);
      setPasswordInput('');
    } catch (err: any) {
      setAuthError(err.message || 'Invalid admin password');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handlers: Logout
  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } finally {
      setIsAuthenticated(false);
    }
  };

  // Handlers: Save Project (Create or Update)
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProject.title.trim() || !newProject.description.trim()) {
      setProjectErrorMsg('Please provide at least a project title and description.');
      return;
    }

    setProjectSaving(true);
    setProjectSuccessMsg(null);
    setProjectErrorMsg(null);

    try {
      const payload = {
        id: editingProjectId || undefined,
        title: newProject.title,
        tagline: newProject.tagline,
        category: newProject.category,
        description: newProject.description,
        tech_stack: newProject.tech_stack
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        demo_url: newProject.demo_url,
        github_url: newProject.github_url,
        featured: newProject.featured,
      };

      const method = editingProjectId ? 'PUT' : 'POST';
      const res = await fetch('/api/projects', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || (editingProjectId ? 'Failed to update project' : 'Failed to create project'));
      }

      setProjectSuccessMsg(
        editingProjectId
          ? `Project "${data.title}" updated and committed to your portfolio!`
          : `Project "${data.title}" added and committed to your live portfolio!`
      );
      setEditingProjectId(null);
      setNewProject({
        title: '',
        tagline: '',
        category: 'Data Analytics',
        description: '',
        tech_stack: '',
        demo_url: '',
        github_url: '',
        featured: false,
      });
      loadProjects();
    } catch (err: any) {
      setProjectErrorMsg(err.message || 'Error saving project');
    } finally {
      setProjectSaving(false);
    }
  };

  const handleStartEditProject = (proj: Project) => {
    setEditingProjectId(proj.id);
    setNewProject({
      title: proj.title || '',
      tagline: proj.tagline || '',
      category: proj.category || 'Data Analytics',
      description: proj.description || '',
      tech_stack: Array.isArray(proj.tech_stack) ? proj.tech_stack.join(', ') : '',
      demo_url: proj.demo_url || '',
      github_url: proj.github_url || '',
      featured: Boolean(proj.featured),
    });
    setProjectSuccessMsg(null);
    setProjectErrorMsg(null);
    const formEl = document.getElementById('project-form-card');
    if (formEl) formEl.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelEditProject = () => {
    setEditingProjectId(null);
    setNewProject({
      title: '',
      tagline: '',
      category: 'Data Analytics',
      description: '',
      tech_stack: '',
      demo_url: '',
      github_url: '',
      featured: false,
    });
    setProjectSuccessMsg(null);
    setProjectErrorMsg(null);
  };

  // Handlers: Delete Project
  const handleDeleteProject = async (id: string, title: string) => {
    if (typeof window !== 'undefined') {
      const confirmed = window.confirm(`Are you sure you want to delete "${title}"? This cannot be undone.`);
      if (!confirmed) return;
    }

    setDeletingProjectId(id);
    setProjectErrorMsg(null);
    setProjectSuccessMsg(null);

    try {
      const res = await fetch(`/api/projects?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete project');
      }

      if (editingProjectId === id) {
        handleCancelEditProject();
      }

      setProjects((prev) => prev.filter((p) => String(p.id).trim() !== String(id).trim()));
      setProjectSuccessMsg(`Project "${title}" was successfully deleted.`);
    } catch (err: any) {
      setProjectErrorMsg(err.message || 'Failed to delete project');
    } finally {
      setDeletingProjectId(null);
    }
  };

  // Handlers: Upload Resume
  const handleResumeUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf' && !file.name.endsWith('.pdf')) {
      setResumeErrorMsg('Only PDF files are supported.');
      return;
    }

    setResumeUploading(true);
    setResumeSuccessMsg(null);
    setResumeErrorMsg(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/resume/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Failed to upload resume');
      }

      setResumeMeta({
        file_url: result.file_url || '/resume.pdf',
        file_name: result.file_name || file.name,
        last_updated: result.last_updated,
      });
      setResumeSuccessMsg('Resume replaced successfully! It is now active on your portfolio.');
    } catch (err: any) {
      setResumeErrorMsg(err.message || 'Upload failed.');
    } finally {
      setResumeUploading(false);
    }
  };

  // Handlers: Create Blog Post
  const handleCreateBlogPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title.trim() || !newPost.excerpt.trim() || !newPost.content.trim()) {
      setBlogErrorMsg('Please provide a title, excerpt, and full content.');
      return;
    }

    setBlogSaving(true);
    setBlogSuccessMsg(null);
    setBlogErrorMsg(null);

    try {
      const res = await fetch('/api/blog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPost.title,
          excerpt: newPost.excerpt,
          content: newPost.content,
          read_time: newPost.read_time || '3 min read',
          date:
            newPost.date ||
            new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to publish post');
      }

      setBlogSuccessMsg(`Article "${data.title}" published to the Thoughts & Notes section!`);
      setNewPost({ title: '', excerpt: '', content: '', read_time: '', date: '' });
      loadBlogPosts();
    } catch (err: any) {
      setBlogErrorMsg(err.message || 'Error publishing post');
    } finally {
      setBlogSaving(false);
    }
  };

  // Handlers: Delete Blog Post
  const handleDeleteBlogPost = async (id: string, title: string) => {
    if (!confirm(`Delete the post "${title}"?`)) return;

    try {
      const res = await fetch(`/api/blog?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete');
      }

      setBlogPosts((prev) => prev.filter((p) => p.id !== id));
      setBlogSuccessMsg(`Post "${title}" deleted.`);
    } catch (err: any) {
      alert(err.message || 'Failed to delete post');
    }
  };

  // Handlers: Save GitHub Token
  const handleSaveGitHubToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tokenInput.trim()) {
      setTokenErrorMsg('Please enter a GitHub Personal Access Token.');
      return;
    }

    setTokenSaving(true);
    setTokenSuccessMsg(null);
    setTokenErrorMsg(null);

    try {
      const res = await fetch('/api/admin/github-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: tokenInput.trim() }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save token');
      }

      setTokenSuccessMsg(data.message || 'GitHub Auto-Commit activated! Your edits will now commit and persist permanently.');
      setTokenInput('');
      loadGitHubStatus();
    } catch (err: any) {
      setTokenErrorMsg(err.message || 'Failed to connect to GitHub');
    } finally {
      setTokenSaving(false);
    }
  };

  // Handlers: Clear GitHub Token
  const handleClearGitHubToken = async () => {
    try {
      await fetch('/api/admin/github-token', { method: 'DELETE' });
      setTokenSuccessMsg(null);
      setTokenErrorMsg(null);
      loadGitHubStatus();
    } catch (err) {
      console.error('Failed to clear token:', err);
    }
  };

  // 3. Loading state during auth check
  if (isAuthenticated === null) {
    return (
      <div className={styles.page} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--color-brown)', fontFamily: 'var(--font-heading)', fontSize: '1.25rem' }}>
          Verifying security authorization...
        </p>
      </div>
    );
  }

  // 4. Unauthenticated: Login Screen
  if (!isAuthenticated) {
    return (
      <div className={styles.page}>
        <div className={styles.loginContainer}>
          <div className={styles.loginCard}>
            <div className={styles.loginHeader}>
              <div className={styles.lockIcon} aria-hidden="true">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </div>
              <h1 className={styles.loginTitle}>Owner Portal</h1>
              <p className={styles.loginSubtitle}>
                Administrative management hub for Edward Emmanuel&apos;s portfolio. Enter your password to update projects, articles, and your resume.
              </p>
            </div>

            <form onSubmit={handleLogin} className={styles.loginForm}>
              {authError && <div className={styles.errorBanner}>{authError}</div>}

              <div className={styles.fieldGroup}>
                <label htmlFor="admin-pass" className={styles.fieldLabel}>
                  Admin Password
                </label>
                <div className={styles.passwordWrapper}>
                  <input
                    id="admin-pass"
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="Enter administrator password"
                    className={`${styles.input} ${styles.passwordInput}`}
                    autoFocus
                    required
                  />
                  <button
                    type="button"
                    className={styles.eyeButton}
                    onClick={() => setShowPassword((prev) => !prev)}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="btn btn-primary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                {authLoading ? 'Verifying...' : 'Authenticate & Enter'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '8px' }}>
                <Link href="/" style={{ fontSize: '0.875rem', color: 'var(--color-muted)', textDecoration: 'underline' }}>
                  &larr; Return to public portfolio
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    );
  }

  // 5. Authenticated Admin Dashboard
  return (
    <div className={styles.page}>
      {/* Admin Top Navigation */}
      <header className={styles.adminNav} role="banner">
        <div className={`container ${styles.navInner}`}>
          <div className={styles.brand}>
            <span className={styles.brandName}>Edward Emmanuel</span>
            <span className={styles.adminBadge}>Data &amp; Engineering Admin</span>
          </div>

          <div className={styles.navActions}>
            <Link href="/" className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.8rem' }}>
              View Live Portfolio
            </Link>
            <button
              onClick={handleLogout}
              className="btn btn-outline"
              style={{ padding: '8px 16px', fontSize: '0.8rem', color: '#8c2417', borderColor: '#eab3a9' }}
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className={styles.adminMain}>
        <div className="container">
          {/* Quick Portfolio Stats Bar */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Projects Showcase</span>
              <span className={styles.statValue}>{projects.length}</span>
              <span className={styles.statDesc}>Active showcase items</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Thoughts &amp; Notes</span>
              <span className={styles.statValue}>{blogPosts.length}</span>
              <span className={styles.statDesc}>Published articles</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>Resume Document</span>
              <span className={styles.statValue} style={{ fontSize: '1.15rem', marginTop: '4px' }}>
                {resumeMeta ? 'Active PDF' : 'Default'}
              </span>
              <span className={styles.statDesc}>
                {resumeMeta ? `Updated: ${resumeMeta.last_updated}` : 'Ready for upload'}
              </span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statLabel}>About Me Profile</span>
              <span className={styles.statValue} style={{ fontSize: '1.15rem', marginTop: '4px' }}>
                {aboutLoading ? 'Loading...' : 'Active Profile'}
              </span>
              <span className={styles.statDesc}>
                {aboutData.paragraphs.length} paragraphs &bull; {aboutData.facts.length} facts
              </span>
            </div>
          </div>

          {/* GitHub Sync Status Banner - only shown after status is loaded to prevent twitch/flicker */}
          {!githubLoading && githubStatus && (
            <div className={`${styles.syncBanner} ${githubStatus.configured ? styles.syncBannerActive : styles.syncBannerWarning}`}>
              <div className={styles.syncBannerLeft}>
                <span
                  className={`${styles.syncIndicatorDot} ${githubStatus.configured ? styles.dotActive : styles.dotWarning}`}
                />
                <div>
                  <span className={styles.syncStatusTitle}>
                    {githubStatus.configured
                      ? `GitHub Auto-Commit Active (${githubStatus.repo})`
                      : 'Persistence Not Configured'}
                  </span>
                  <span className={styles.syncStatusDesc}>
                    {githubStatus.configured
                      ? `Logged in as @${githubStatus.username || 'connected'} — edits commit directly to your repository and stay permanently on the portfolio.`
                      : 'Edits will not persist on Vercel without GitHub Auto-Commit or Supabase. Set up storage in the Storage & Sync tab.'}
                  </span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
                <span className={`${styles.syncBadge} ${githubStatus.configured ? styles.syncBadgeActive : styles.syncBadgeWarning}`}>
                  {githubStatus.configured ? '● Live Sync' : '○ Needs Setup'}
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('storage')}
                  className="btn btn-outline"
                  style={{ padding: '6px 14px', fontSize: '0.78rem', whiteSpace: 'nowrap' }}
                >
                  {githubStatus.configured ? 'Manage' : 'Setup Now'}
                </button>
              </div>
            </div>
          )}

          {/* Navigation Tabs */}
          <div className={styles.tabRow} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'about'}
              className={`${styles.tabBtn} ${activeTab === 'about' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('about')}
            >
              About Me Profile
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'blog'}
              className={`${styles.tabBtn} ${activeTab === 'blog' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('blog')}
            >
              Thoughts &amp; Notes ({blogPosts.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'projects'}
              className={`${styles.tabBtn} ${activeTab === 'projects' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              Side Projects ({projects.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'resume'}
              className={`${styles.tabBtn} ${activeTab === 'resume' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('resume')}
            >
              Resume PDF Manager
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'storage'}
              className={`${styles.tabBtn} ${activeTab === 'storage' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('storage')}
              style={{ position: 'relative' }}
            >
              Storage &amp; Sync
              {githubStatus && !githubStatus.configured && (
                <span className={styles.tabNotificationDot} />
              )}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'overview'}
              className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Site Overview &amp; Setup
            </button>
          </div>

          {/* TAB 0: ABOUT ME PROFILE */}
          {activeTab === 'about' && (
            <div style={{ maxWidth: '840px', margin: '0 auto' }}>
              <div className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>About Me Profile Editor</h2>
                <p className={styles.sectionDesc}>
                  Customize your personal story, headline, bio paragraphs, and overview metrics.
                  When saved, changes are automatically committed to your GitHub repository and update your live portfolio.
                </p>

                {aboutSuccessMsg && (
                  <div className={styles.successBanner} style={{ marginBottom: '20px' }}>
                    <span>✓</span> {aboutSuccessMsg}
                  </div>
                )}

                {aboutErrorMsg && (
                  <div className={styles.errorBanner} style={{ marginBottom: '20px' }}>
                    {aboutErrorMsg}
                  </div>
                )}

                <form onSubmit={handleSaveAbout}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="about-eyebrow" className={styles.fieldLabel}>
                      Section Tag / Eyebrow
                    </label>
                    <input
                      id="about-eyebrow"
                      type="text"
                      className={styles.input}
                      value={aboutData.eyebrow}
                      onChange={(e) => setAboutData({ ...aboutData, eyebrow: e.target.value })}
                      placeholder="About Me"
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label htmlFor="about-heading" className={styles.fieldLabel}>
                      Main Headline / Punchline *
                    </label>
                    <input
                      id="about-heading"
                      type="text"
                      className={styles.input}
                      value={aboutData.heading}
                      onChange={(e) => setAboutData({ ...aboutData, heading: e.target.value })}
                      placeholder="Building at the intersection of data & code."
                      required
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      Bio &amp; Narrative Paragraphs *
                    </label>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginBottom: '12px' }}>
                      Add paragraphs telling visitors about your background, tools, methodologies, and hobbies.
                    </p>

                    {aboutData.paragraphs.map((para, idx) => (
                      <div key={idx} className={styles.paragraphItem}>
                        <div className={styles.paragraphHeader}>
                          <span className={styles.paragraphLabel}>Paragraph {idx + 1}</span>
                          {aboutData.paragraphs.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveParagraph(idx)}
                              className={styles.removeParaBtn}
                            >
                              ✕ Remove
                            </button>
                          )}
                        </div>
                        <textarea
                          rows={3}
                          className={styles.textarea}
                          value={para}
                          onChange={(e) => handleParagraphChange(idx, e.target.value)}
                          placeholder={`Enter paragraph ${idx + 1}...`}
                          required
                        />
                      </div>
                    ))}

                    <button
                      type="button"
                      onClick={handleAddParagraph}
                      className={styles.addParaBtn}
                    >
                      <span>+ Add Another Paragraph</span>
                    </button>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel}>
                      Quick Overview Highlights
                    </label>
                    <div className={styles.factsGrid}>
                      {aboutData.facts.map((fact, idx) => (
                        <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                          <label style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-muted)', fontWeight: 700 }}>
                            {fact.label || `Highlight ${idx + 1}`}
                          </label>
                          <input
                            type="text"
                            className={styles.input}
                            value={fact.value}
                            onChange={(e) => handleFactChange(idx, 'value', e.target.value)}
                            placeholder="e.g., Nigeria"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.formBtnRow} style={{ marginTop: '28px' }}>
                    <button
                      type="submit"
                      disabled={aboutSaving}
                      className="btn btn-primary"
                    >
                      {aboutSaving ? 'Saving & Committing to GitHub...' : 'Save & Commit Profile Changes'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* TAB 1: SIDE PROJECTS */}
          {activeTab === 'projects' && (
            <div className={styles.dashboardGrid}>
              {/* Left Column: Add / Edit Project Form */}
              <div id="project-form-card" className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>
                  {editingProjectId ? 'Edit Side Project' : 'Publish Side Project'}
                </h2>
                <p className={styles.sectionDesc}>
                  {editingProjectId
                    ? 'Modify the details, technologies, or live links for this project. Updates are immediately reflected.'
                    : 'Add an analytics dashboard, data engineering pipeline, machine learning model, or full-stack software project to your public portfolio.'}
                </p>

                {editingProjectId && (
                  <div className={styles.editingBanner}>
                    <span className={styles.editingBannerText}>
                      Editing &ldquo;{newProject.title || 'Untitled Project'}&rdquo;
                    </span>
                    <button
                      type="button"
                      onClick={handleCancelEditProject}
                      className={styles.cancelBtn}
                      style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    >
                      Cancel Edit
                    </button>
                  </div>
                )}

                {projectSuccessMsg && (
                  <div className={styles.successBanner} style={{ marginBottom: '20px' }}>
                    <span>✓</span> {projectSuccessMsg}
                  </div>
                )}

                {projectErrorMsg && (
                  <div className={styles.errorBanner} style={{ marginBottom: '20px' }}>
                    {projectErrorMsg}
                  </div>
                )}

                <form onSubmit={handleSaveProject} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="proj-title">Project Title *</label>
                    <input
                      id="proj-title"
                      type="text"
                      className={styles.input}
                      placeholder="e.g. Retail Sales & Inventory Forecasting Engine"
                      value={newProject.title}
                      onChange={(e) => setNewProject({ ...newProject, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.formRow2}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel} htmlFor="proj-tagline">Tagline / Value Proposition</label>
                      <input
                        id="proj-tagline"
                        type="text"
                        className={styles.input}
                        placeholder="e.g. Predictive analytics & inventory optimization"
                        value={newProject.tagline}
                        onChange={(e) => setNewProject({ ...newProject, tagline: e.target.value })}
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel} htmlFor="proj-category">Domain Category</label>
                      <select
                        id="proj-category"
                        className={styles.input}
                        value={newProject.category}
                        onChange={(e) => setNewProject({ ...newProject, category: e.target.value })}
                      >
                        <option value="Data Analytics">Data Analytics</option>
                        <option value="Data Science & ML">Data Science &amp; ML</option>
                        <option value="Data Engineering">Data Engineering</option>
                        <option value="Full-Stack">Full-Stack</option>
                        <option value="Fintech & Backend">Fintech &amp; Backend</option>
                        <option value="Business Intelligence">Business Intelligence</option>
                        <option value="Open Source">Open Source</option>
                      </select>
                    </div>
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="proj-desc">Description &amp; Problem Solved *</label>
                    <textarea
                      id="proj-desc"
                      className={`${styles.input} ${styles.textarea}`}
                      placeholder="Describe what business challenge this solves, data transformations performed, metrics/insights generated, and architectural decisions..."
                      value={newProject.description}
                      onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="proj-tech">Tech Stack (comma-separated)</label>
                    <input
                      id="proj-tech"
                      type="text"
                      className={styles.input}
                      placeholder="e.g. Python, SQL, PostgreSQL, Pandas, Power BI, Next.js"
                      value={newProject.tech_stack}
                      onChange={(e) => setNewProject({ ...newProject, tech_stack: e.target.value })}
                    />
                  </div>

                  <div className={styles.formRow2}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel} htmlFor="proj-demo">Live Demo / Dashboard URL</label>
                      <input
                        id="proj-demo"
                        type="url"
                        className={styles.input}
                        placeholder="https://..."
                        value={newProject.demo_url}
                        onChange={(e) => setNewProject({ ...newProject, demo_url: e.target.value })}
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel} htmlFor="proj-gh">GitHub Repo URL</label>
                      <input
                        id="proj-gh"
                        type="url"
                        className={styles.input}
                        placeholder="https://github.com/..."
                        value={newProject.github_url}
                        onChange={(e) => setNewProject({ ...newProject, github_url: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className={styles.checkboxRow}>
                    <input
                      id="proj-featured"
                      type="checkbox"
                      className={styles.checkbox}
                      checked={newProject.featured}
                      onChange={(e) => setNewProject({ ...newProject, featured: e.target.checked })}
                    />
                    <label htmlFor="proj-featured" style={{ fontSize: '0.875rem', cursor: 'pointer', fontWeight: 600, color: 'var(--color-ink)' }}>
                      Feature this project with priority highlight
                    </label>
                  </div>

                  <div className={editingProjectId ? styles.formBtnRow : undefined}>
                    <button
                      type="submit"
                      disabled={projectSaving}
                      className="btn btn-primary"
                      style={{ marginTop: editingProjectId ? 0 : '8px', justifyContent: 'center', flex: 1 }}
                    >
                      {projectSaving
                        ? editingProjectId
                          ? 'Updating Project...'
                          : 'Publishing Project...'
                        : editingProjectId
                        ? 'Save & Update Project'
                        : 'Publish Project to Portfolio'}
                    </button>
                    {editingProjectId && (
                      <button
                        type="button"
                        onClick={handleCancelEditProject}
                        className={styles.cancelBtn}
                        disabled={projectSaving}
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>
              </div>

              {/* Right Column: Existing Projects List */}
              <div className={styles.sectionCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <h2 className={styles.sectionTitle}>Published Projects ({projects.length})</h2>
                  <button
                    onClick={loadProjects}
                    style={{ fontSize: '0.8rem', color: 'var(--color-brown)', cursor: 'pointer', textDecoration: 'underline', background: 'none', border: 'none', fontWeight: 600 }}
                  >
                    Refresh
                  </button>
                </div>
                <p className={styles.sectionDesc}>
                  Live projects currently visible on your portfolio showcase.
                </p>

                {projectsLoading ? (
                  <p style={{ color: 'var(--color-muted)' }}>Loading projects...</p>
                ) : projects.length === 0 ? (
                  <p style={{ color: 'var(--color-muted)' }}>No projects uploaded yet.</p>
                ) : (
                  <div className={styles.projectList}>
                    {projects.map((proj) => (
                      <div key={proj.id} className={styles.projectItem} style={editingProjectId === proj.id ? { borderColor: 'var(--color-brown)', backgroundColor: 'rgba(232, 220, 166, 0.25)' } : undefined}>
                        <div className={styles.projectItemTop}>
                          <div>
                            <span className={styles.itemCategory}>
                              {proj.category}
                            </span>
                            <h3 className={styles.itemTitle}>{proj.title}</h3>
                          </div>
                          <div className={styles.itemActions}>
                            <button
                              type="button"
                              onClick={() => handleStartEditProject(proj)}
                              className={styles.editBtn}
                              title="Edit this project"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              disabled={deletingProjectId === proj.id}
                              onClick={() => handleDeleteProject(proj.id, proj.title)}
                              className={styles.deleteBtn}
                              title="Delete this project"
                            >
                              {deletingProjectId === proj.id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>

                        {proj.tagline && (
                          <p style={{ fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--color-muted)' }}>
                            {proj.tagline}
                          </p>
                        )}

                        <p style={{ fontSize: '0.875rem', color: 'var(--color-ink)', lineHeight: '1.55' }}>
                          {proj.description.slice(0, 150)}...
                        </p>

                        {proj.tech_stack && proj.tech_stack.length > 0 && (
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                            {proj.tech_stack.map((t, idx) => (
                              <span key={idx} className={styles.tagBadge}>
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BLOG / THOUGHTS & NOTES */}
          {activeTab === 'blog' && (
            <div className={styles.dashboardGrid}>
              {/* Left Column: Write Post Form */}
              <div className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>Publish Thought or Article</h2>
                <p className={styles.sectionDesc}>
                  Publish articles, case studies, or insights to the &ldquo;Thoughts &amp; Notes&rdquo; column under your About Me section.
                </p>

                {blogSuccessMsg && (
                  <div className={styles.successBanner} style={{ marginBottom: '20px' }}>
                    <span>✓</span> {blogSuccessMsg}
                  </div>
                )}

                {blogErrorMsg && (
                  <div className={styles.errorBanner} style={{ marginBottom: '20px' }}>
                    {blogErrorMsg}
                  </div>
                )}

                <form onSubmit={handleCreateBlogPost} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="blog-title">Article Title *</label>
                    <input
                      id="blog-title"
                      type="text"
                      className={styles.input}
                      placeholder="e.g. From Raw Datasets to Business Value: Lessons from 100k+ Records"
                      value={newPost.title}
                      onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="blog-excerpt">Excerpt / Overview *</label>
                    <input
                      id="blog-excerpt"
                      type="text"
                      className={styles.input}
                      placeholder="Why clean data pipelines and honest metrics drive stronger decisions than complex models alone..."
                      value={newPost.excerpt}
                      onChange={(e) => setNewPost({ ...newPost, excerpt: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.fieldGroup}>
                    <label className={styles.fieldLabel} htmlFor="blog-content">Full Post Content *</label>
                    <textarea
                      id="blog-content"
                      className={`${styles.input} ${styles.textarea}`}
                      style={{ minHeight: '220px' }}
                      placeholder={"Write your full article here. Leave a blank line between paragraphs.\nUse **bold text** for key takeaways.\n\nExample:\n\nIn modern analytics, understanding business context comes before choosing algorithms...\n\nSecond paragraph here."}
                      value={newPost.content}
                      onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                      required
                    />
                  </div>

                  <div className={styles.formRow2}>
                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel} htmlFor="blog-date">Date Display (e.g. September 2024)</label>
                      <input
                        id="blog-date"
                        type="text"
                        className={styles.input}
                        placeholder="Leave blank to use current month"
                        value={newPost.date}
                        onChange={(e) => setNewPost({ ...newPost, date: e.target.value })}
                      />
                    </div>

                    <div className={styles.fieldGroup}>
                      <label className={styles.fieldLabel} htmlFor="blog-readtime">Estimated Read Time</label>
                      <input
                        id="blog-readtime"
                        type="text"
                        className={styles.input}
                        placeholder="e.g. 4 min read"
                        value={newPost.read_time}
                        onChange={(e) => setNewPost({ ...newPost, read_time: e.target.value })}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={blogSaving}
                    className="btn btn-primary"
                    style={{ marginTop: '8px', justifyContent: 'center' }}
                  >
                    {blogSaving ? 'Publishing Article...' : 'Publish to Thoughts & Notes'}
                  </button>
                </form>
              </div>

              {/* Right Column: Published Posts */}
              <div className={styles.sectionCard}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <h2 className={styles.sectionTitle}>Published Thoughts ({blogPosts.length})</h2>
                  <button
                    onClick={loadBlogPosts}
                    style={{ fontSize: '0.8rem', color: 'var(--color-brown)', cursor: 'pointer', textDecoration: 'underline', background: 'none', border: 'none', fontWeight: 600 }}
                  >
                    Refresh
                  </button>
                </div>
                <p className={styles.sectionDesc}>
                  Live articles currently visible in the About Me section.
                </p>

                {blogLoading ? (
                  <p style={{ color: 'var(--color-muted)' }}>Loading articles...</p>
                ) : blogPosts.length === 0 ? (
                  <p style={{ color: 'var(--color-muted)' }}>No articles published yet.</p>
                ) : (
                  <div className={styles.projectList}>
                    {blogPosts.map((post) => (
                      <div key={post.id} className={styles.projectItem}>
                        <div className={styles.projectItemTop}>
                          <div>
                            <span className={styles.itemCategory}>
                              {post.date} &middot; {post.read_time}
                            </span>
                            <h3 className={styles.itemTitle}>{post.title}</h3>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleDeleteBlogPost(post.id, post.title)}
                            className={styles.deleteBtn}
                            title="Delete this post"
                          >
                            Delete
                          </button>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-ink)', lineHeight: '1.55' }}>
                          {post.excerpt}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: RESUME UPLOADER */}
          {activeTab === 'resume' && (
            <div style={{ maxWidth: '680px', margin: '0 auto' }}>
              <div className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>Resume PDF Document Manager</h2>
                <p className={styles.sectionDesc}>
                  Upload and update your official PDF resume. Visitors on the live portfolio will immediately see the updated preview and will download this exact document.
                </p>

                {resumeSuccessMsg && (
                  <div className={styles.successBanner} style={{ marginBottom: '20px' }}>
                    <span>✓</span> {resumeSuccessMsg}
                  </div>
                )}

                {resumeErrorMsg && (
                  <div className={styles.errorBanner} style={{ marginBottom: '20px' }}>
                    {resumeErrorMsg}
                  </div>
                )}

                {resumeMeta && (
                  <div className={styles.fileMetaCard}>
                    <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: 'var(--color-brown)', fontWeight: 700, letterSpacing: '0.08em' }}>
                      Currently Active Resume
                    </p>
                    <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: '1.15rem', color: 'var(--color-black)' }}>
                      {resumeMeta.file_name}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-muted)' }}>
                      Last Updated: {resumeMeta.last_updated}
                    </p>
                    <div style={{ marginTop: '8px', display: 'flex', gap: '12px' }}>
                      <a
                        href={resumeMeta.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline"
                        style={{ padding: '6px 14px', fontSize: '0.8rem' }}
                      >
                        Preview Active PDF &rarr;
                      </a>
                    </div>
                  </div>
                )}

                {/* File Dropzone */}
                <label className={styles.dropzone} htmlFor="admin-resume-upload">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--color-brown)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <polyline points="17 8 12 3 7 8" />
                    <line x1="12" y1="3" x2="12" y2="15" />
                  </svg>
                  <div>
                    <p style={{ fontWeight: 700, color: 'var(--color-black)' }}>
                      {resumeUploading ? 'Uploading & Deploying Resume...' : 'Click to select or drop new PDF resume'}
                    </p>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: '4px' }}>
                      Replaces the live document immediately across the portfolio.
                    </p>
                  </div>
                  <input
                    id="admin-resume-upload"
                    type="file"
                    accept="application/pdf"
                    style={{ display: 'none' }}
                    onChange={handleResumeUpload}
                    disabled={resumeUploading}
                  />
                </label>
              </div>
            </div>
          )}

          {/* TAB 4: STORAGE & GITHUB AUTO-COMMIT */}
          {activeTab === 'storage' && (
            <div style={{ maxWidth: '760px', margin: '0 auto' }}>
              <div className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>Storage &amp; GitHub Auto-Commit</h2>
                <p className={styles.sectionDesc}>
                  Connect your GitHub account so that every project, blog article, or resume change you make in this admin portal
                  is automatically committed to your repository and permanently saved. Without this setup, changes will not
                  persist when running on Vercel.
                </p>

                {/* Current Status */}
                <div
                  style={{
                    padding: '16px 20px',
                    borderRadius: 'var(--radius-sm)',
                    marginBottom: '24px',
                    background: githubStatus?.configured ? '#f1f8f3' : '#fff9e6',
                    border: `1px solid ${githubStatus?.configured ? '#b7e0c4' : '#f2dc9b'}`,
                  }}
                >
                  <p style={{ fontWeight: 700, fontFamily: 'var(--font-heading)', marginBottom: '4px', color: githubStatus?.configured ? '#1b532f' : '#634300' }}>
                    {githubStatus?.configured
                      ? `Connected: @${githubStatus.username} has write access to ${githubStatus.repo}`
                      : 'Not Connected: Auto-Commit is not active'}
                  </p>
                  <p style={{ fontSize: '0.85rem', color: githubStatus?.configured ? '#2d6a4f' : '#805000' }}>
                    {githubStatus?.configured
                      ? `Branch: ${githubStatus.branch} | Source: ${githubStatus.source === 'environment' ? 'Vercel Environment Variable (GITHUB_TOKEN)' : 'Session Cookie (token you entered below)'}`
                      : 'Follow the steps below to activate GitHub Auto-Commit.'}
                  </p>
                  {githubStatus?.configured && (
                    <button
                      type="button"
                      onClick={handleClearGitHubToken}
                      style={{ marginTop: '10px', fontSize: '0.8rem', color: '#8c2417', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', padding: 0 }}
                    >
                      Disconnect session token
                    </button>
                  )}
                </div>

                {tokenSuccessMsg && (
                  <div className={styles.successBanner} style={{ marginBottom: '20px' }}>
                    <span>✓</span> {tokenSuccessMsg}
                  </div>
                )}

                {tokenErrorMsg && (
                  <div className={styles.errorBanner} style={{ marginBottom: '20px' }}>
                    {tokenErrorMsg}
                  </div>
                )}

                {/* Token Input Form */}
                <form onSubmit={handleSaveGitHubToken}>
                  <div className={styles.fieldGroup}>
                    <label htmlFor="github-token-input" className={styles.fieldLabel}>
                      GitHub Personal Access Token
                    </label>
                    <div className={styles.tokenInputRow}>
                      <input
                        id="github-token-input"
                        type="password"
                        value={tokenInput}
                        onChange={(e) => setTokenInput(e.target.value)}
                        placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                        className={styles.input}
                        style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.875rem' }}
                        autoComplete="off"
                      />
                      <button
                        type="submit"
                        disabled={tokenSaving || !tokenInput.trim()}
                        className="btn btn-primary"
                        style={{ whiteSpace: 'nowrap' }}
                      >
                        {tokenSaving ? 'Verifying...' : 'Connect'}
                      </button>
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--color-muted)', marginTop: '6px' }}>
                      The token is stored in a secure HTTP-only cookie in your browser session. For permanent setup across all sessions and devices, add it as a Vercel Environment Variable instead.
                    </p>
                  </div>
                </form>

                {/* Setup Instructions */}
                <div className={styles.instructionsBox}>
                  <p className={styles.instructionTitle}>How to set up GitHub Auto-Commit (3 steps)</p>
                  <ol className={styles.stepList}>
                    <li className={styles.stepItem}>
                      <span className={styles.stepNumber}>1</span>
                      <span>
                        Go to{' '}
                        <a
                          href="https://github.com/settings/tokens"
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--color-brown)', fontWeight: 600 }}
                        >
                          github.com/settings/tokens
                        </a>{' '}
                        and click <strong>Generate new token (classic)</strong>. Give it a name like &ldquo;Portfolio Admin&rdquo;.
                      </span>
                    </li>
                    <li className={styles.stepItem}>
                      <span className={styles.stepNumber}>2</span>
                      <span>
                        Under <strong>Scopes</strong>, check <strong>repo</strong> (this gives read and write access to your repository). Scroll down and click <strong>Generate token</strong>. Copy the token — it starts with <code style={{ fontFamily: 'monospace', background: 'var(--color-stone)', padding: '1px 5px', borderRadius: '3px' }}>ghp_</code>
                      </span>
                    </li>
                    <li className={styles.stepItem}>
                      <span className={styles.stepNumber}>3</span>
                      <span>
                        <strong>For permanent setup on Vercel:</strong> Go to your Vercel project dashboard &rarr; Settings &rarr; Environment Variables, add <code style={{ fontFamily: 'monospace', background: 'var(--color-stone)', padding: '1px 5px', borderRadius: '3px' }}>GITHUB_TOKEN</code> with your token value, then redeploy.
                        <br /><br />
                        <strong>For session-only setup:</strong> Paste the token in the input above and click &ldquo;Connect&rdquo;. This works for the current browser session.
                      </span>
                    </li>
                  </ol>
                </div>

                {/* Target Repository Info */}
                <div style={{ marginTop: '20px', padding: '14px 16px', background: 'var(--color-paper)', border: '1px solid var(--color-stone)', borderRadius: 'var(--radius-sm)', fontSize: '0.875rem', color: 'var(--color-ink)' }}>
                  <strong>Target repository:</strong>{' '}
                  <a
                    href="https://github.com/emmanueledward303/portfolio"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--color-brown)', fontWeight: 600 }}
                  >
                    emmanueledward303/portfolio
                  </a>{' '}
                  &bull; Branch: <code style={{ fontFamily: 'monospace', background: 'var(--color-stone)', padding: '1px 5px', borderRadius: '3px' }}>main</code>
                  <br />
                  <span style={{ color: 'var(--color-muted)', fontSize: '0.825rem', marginTop: '4px', display: 'block' }}>
                    When active, each admin save creates a real Git commit in your repository, permanently storing your data and triggering automatic Vercel redeploy.
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: SITE OVERVIEW & CONTACT */}
          {activeTab === 'overview' && (
            <div style={{ maxWidth: '840px', margin: '0 auto' }}>
              <div className={styles.sectionCard}>
                <h2 className={styles.sectionTitle}>Portfolio Identity &amp; System Configuration</h2>
                <p className={styles.sectionDesc}>
                  Summary of your public brand, contact delivery status, and active sections across the Whipped Butter &amp; Cookie Crumble design system.
                </p>

                <div className={styles.infoGrid}>
                  <div className={styles.infoCard}>
                    <div className={styles.infoCardHeader}>
                      <span></span> Professional Identity
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-ink)' }}>
                      <strong>Edward Emmanuel</strong> (Emmanuel Edward Nchekubechukwu)
                    </p>
                    <p style={{ fontSize: '0.825rem', color: 'var(--color-muted)' }}>
                      Data Analyst &amp; Software / Analytics Engineer specializing in predictive data analytics, statistical modeling, ETL pipelines, and full-stack web applications.
                    </p>
                  </div>

                  <div className={styles.infoCard}>
                    <div className={styles.infoCardHeader}>
                      Contact Delivery Status
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-ink)' }}>
                      <strong>emmanueledward303@gmail.com</strong>
                    </p>
                    <p style={{ fontSize: '0.825rem', color: 'var(--color-muted)' }}>
                      All messages submitted via the public Contact Form route to this Gmail address via SMTP Nodemailer.
                    </p>
                  </div>

                  <div className={styles.infoCard}>
                    <div className={styles.infoCardHeader}>
                      Visual Theme
                    </div>
                    <p style={{ fontSize: '0.9rem', color: 'var(--color-ink)' }}>
                      <strong>Whipped Butter &amp; Cookie Crumble</strong>
                    </p>
                    <p style={{ fontSize: '0.825rem', color: 'var(--color-muted)' }}>
                      Strict zero-grey palette using warm paper (#F2E6B3), cream (#E8DCA6), warm stone (#DAC98B), and cookie crumble (#4B2E21) typography.
                    </p>
                  </div>

                  <div className={styles.infoCard}>
                    <div className={styles.infoCardHeader}>
                      Public Sections
                    </div>
                    <p style={{ fontSize: '0.825rem', color: 'var(--color-ink)' }}>
                      &bull; <strong>Hero</strong>: Value statement &amp; credentials<br />
                      &bull; <strong>About</strong>: Biography &amp; Thoughts &amp; Notes<br />
                      &bull; <strong>Side Projects</strong>: Filterable engineering showcase<br />
                      &bull; <strong>Tech Stack</strong>: Categorized skill competencies<br />
                      &bull; <strong>Resume</strong>: Live PDF preview &amp; download<br />
                      &bull; <strong>Contact</strong>: Direct inquiry form
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <Link href="/#projects" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '8px 16px' }}>
                    View Projects Showcase &rarr;
                  </Link>
                  <Link href="/#contact" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '8px 16px' }}>
                    Test Contact Form &rarr;
                  </Link>
                  <Link href="/privacy" className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '8px 16px' }}>
                    View Privacy Policy &rarr;
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
