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
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Active tab: 'projects' | 'blog' | 'resume' | 'overview'
  const [activeTab, setActiveTab] = useState<'projects' | 'blog' | 'resume' | 'overview'>('projects');

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
      loadProjects();
      loadResume();
      loadBlogPosts();
    }
  }, [isAuthenticated]);

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
          ? `Project "${data.title}" successfully updated!`
          : `Project "${data.title}" successfully added to your portfolio!`
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
                <input
                  id="admin-pass"
                  type="password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter administrator password"
                  className={styles.input}
                  autoFocus
                  required
                />
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
              <span className={styles.statLabel}>Primary Contact</span>
              <span className={styles.statValue} style={{ fontSize: '0.9rem', wordBreak: 'break-all', marginTop: '6px' }}>
                emmanueledward303@gmail.com
              </span>
              <span className={styles.statDesc}>Inbound form recipient</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className={styles.tabRow} role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'projects'}
              className={`${styles.tabBtn} ${activeTab === 'projects' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('projects')}
            >
              Side Projects Showcase ({projects.length})
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'blog'}
              className={`${styles.tabBtn} ${activeTab === 'blog' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('blog')}
            >
              Thoughts &amp; Notes / Blog ({blogPosts.length})
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
              aria-selected={activeTab === 'overview'}
              className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabActive : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Site Overview &amp; Setup
            </button>
          </div>

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

          {/* TAB 4: SITE OVERVIEW & CONTACT */}
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
