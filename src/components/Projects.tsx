'use client';

import React, { useEffect, useState } from 'react';
import styles from './Projects.module.css';

export interface Project {
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

function ExternalIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15 3 21 3 21 9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

/**
 * Static placeholder projects rendered while the API loads or if it is
 * unavailable. Keeps the section visually complete for every visitor.
 */
const FALLBACK_PROJECTS: Project[] = [
  {
    id: 'fallback-1',
    title: 'Portfolio Website',
    tagline: 'The site you are viewing right now.',
    description:
      'A personal portfolio built with Next.js 15, TypeScript, and vanilla CSS. Features an admin CMS, dynamic sections, and responsive design.',
    category: 'Web Development',
    tech_stack: ['Next.js', 'TypeScript', 'Python', 'PostgreSQL'],
    featured: true,
  },
  {
    id: 'fallback-2',
    title: 'Data Analytics Dashboard',
    tagline: 'Turning spreadsheets into decisions.',
    description:
      'Interactive BI dashboard built to surface KPIs from raw CSV exports. Automated ETL pipeline with Python + Pandas, visualised in a React frontend.',
    category: 'Data & Analytics',
    tech_stack: ['Python', 'Pandas', 'React', 'SQL'],
  },
];

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>(FALLBACK_PROJECTS);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    let isMounted = true;
    fetch('/api/projects')
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && Array.isArray(data) && data.length > 0) {
          // Real projects available — replace the fallback content.
          setProjects(data);
        }
        // An empty array or non-array response keeps the current projects
        // displayed so the grid never appears blank.
      })
      .catch((err) => {
        console.warn('Projects: /api/projects fetch failed — keeping current projects.', err);
        // Do NOT clear projects on error; the fallback stays visible.
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute unique categories
  const categories = ['All', ...Array.from(new Set(projects.map((p) => p.category).filter(Boolean)))];

  const filteredProjects = selectedCategory === 'All'
    ? projects
    : projects.filter((p) => p.category === selectedCategory);

  return (
    <section id="projects" className={styles.section} aria-label="Side Projects Showcase">
      <div className="container">
        <div className={styles.header}>
          <p className={styles.eyebrow}>Engineering Lab &amp; Products</p>
          <h2 className={styles.heading}>Side Projects Showcase</h2>
          <p className={styles.subheading}>
            Independent systems, data pipelines, and full-stack software I have architected and deployed.
            Built with production-grade engineering principles to solve real-world problems.
          </p>
        </div>

        {/* Filter categories */}
        {!loading && categories.length > 2 && (
          <div className={styles.filterRow} role="tablist" aria-label="Filter projects by category">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                role="tab"
                aria-selected={selectedCategory === cat}
                className={`${styles.filterBtn} ${selectedCategory === cat ? styles.filterActive : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className={styles.grid} role="status" aria-label="Loading projects">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className={`${styles.card} ${styles.skeletonCard}`}>
                <div className="skeleton" style={{ width: '100px', height: '18px', marginBottom: '14px' }} />
                <div className="skeleton" style={{ width: '75%', height: '26px', marginBottom: '8px' }} />
                <div className="skeleton" style={{ width: '55%', height: '16px', marginBottom: '16px' }} />
                <div className="skeleton" style={{ width: '100%', height: '70px', marginBottom: '20px' }} />
                <div className="skeleton" style={{ width: '80%', height: '24px', marginTop: 'auto' }} />
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#5a5550' }}>
            <p>No projects found in this category.</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredProjects.map((project) => (
              <article key={project.id} className={`${styles.card} card-tab`} aria-label={project.title}>
                <div className={styles.cardTop}>
                  {project.image_url && (
                    <div className={styles.cardImageWrapper}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={project.image_url}
                        alt={`${project.title} screenshot`}
                        className={styles.cardImage}
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className={styles.cardMeta}>
                    <span className={styles.categoryBadge}>{project.category}</span>
                    {project.featured && (
                      <span className={styles.featuredBadge}>★ Featured</span>
                    )}
                  </div>

                  <h3 className={styles.cardTitle}>{project.title}</h3>

                  {project.tagline && (
                    <p className={styles.cardTagline}>{project.tagline}</p>
                  )}

                  <p className={styles.cardDesc}>{project.description}</p>
                </div>

                <div>
                  {project.tech_stack && project.tech_stack.length > 0 && (
                    <ul className={styles.techList} aria-label="Technologies used">
                      {project.tech_stack.map((tech, idx) => (
                        <li key={idx} className={styles.techTag}>
                          {tech}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className={styles.cardActions}>
                    {project.demo_url && (
                      <a
                        href={project.demo_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.projectLink}
                        aria-label={`Visit live demo for ${project.title}`}
                      >
                        <ExternalIcon />
                        Live Demo
                      </a>
                    )}

                    {project.github_url && (
                      <a
                        href={project.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.projectLink} ${styles.secondaryLink}`}
                        aria-label={`View source code on GitHub for ${project.title}`}
                      >
                        <GitHubIcon />
                        Source Code
                      </a>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
