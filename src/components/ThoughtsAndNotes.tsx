'use client';

import React, { useEffect, useState } from 'react';
import styles from './ThoughtsAndNotes.module.css';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  read_time: string;
  slug: string;
}

/**
 * Static placeholder articles shown when the /api/blog endpoint is unavailable
 * or has not yet returned data. Prevents the section from ever appearing blank.
 */
const FALLBACK_POSTS: BlogPost[] = [
  {
    id: 'fallback-1',
    title: 'From Raw Data to Real Decisions',
    excerpt:
      'How I approach messy datasets — cleaning, transforming, and surfacing the signal that actually matters for decision-making.',
    content:
      'Data rarely arrives clean. The pipeline from raw CSV to actionable insight involves careful validation, thoughtful transformation, and honest communication of uncertainty. In this post I walk through the workflow I have refined over dozens of projects.',
    date: 'Coming soon',
    read_time: '5 min read',
    slug: 'raw-data-to-decisions',
  },
  {
    id: 'fallback-2',
    title: 'Building Full-Stack Apps as a Solo Developer',
    excerpt:
      'Lessons learned shipping production-grade Next.js + Python backends without a team — architecture decisions, trade-offs, and what I would do differently.',
    content:
      'Solo full-stack development forces you to think deeply about every layer of the stack. From database schema design to deployment pipelines, every decision lands on one set of shoulders. Here are the patterns that have served me best.',
    date: 'Coming soon',
    read_time: '7 min read',
    slug: 'solo-fullstack-lessons',
  },
];

export default function ThoughtsAndNotes() {
  const [posts, setPosts] = useState<BlogPost[]>(FALLBACK_POSTS);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = () => {
      fetch('/api/blog')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            // Real posts available — replace the fallback content.
            setPosts(data);
          }
          // If data is an empty array or non-array, keep whatever is already
          // displayed (fallback or a previously loaded set) so the section
          // never goes blank mid-session.
        })
        .catch((err) => {
          console.warn(
            'ThoughtsAndNotes: /api/blog fetch failed — keeping current posts.',
            err,
          );
          // Do NOT clear posts on error; the fallback / previous data stays visible.
        })
        .finally(() => setLoading(false));
    };

    fetchPosts();
    const interval = setInterval(fetchPosts, 30_000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="thoughts" className={styles.section} aria-labelledby="thoughts-heading">
      <div className="container">
        {/* Section Header */}
        <div className={styles.sectionHeader}>
          <p className={styles.eyebrow}>Writing &amp; Perspectives</p>
          <h2 id="thoughts-heading" className={styles.heading}>
            Thoughts &amp; Notes
          </h2>
          <p className={styles.subheading}>
            Observations on data analytics, workflow automation, modern full-stack development, and building tools that matter.
          </p>
        </div>

        {/* Posts Display */}
        {loading && posts.length === 0 ? (
          <div className={styles.emptyState}>
            <p>Loading articles...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>No notes published yet</p>
            <p className={styles.emptyDesc}>
              Articles and engineering write-ups will appear here once published from the admin portal.
            </p>
          </div>
        ) : (
          <div className={styles.postsGrid}>
            {posts.map((post) => (
              <article key={post.id} className={styles.postCard}>
                <div className={styles.postTop}>
                  <div className={styles.postMeta}>
                    <span className={styles.postDate}>{post.date}</span>
                    <span className={styles.postDot} aria-hidden="true">&bull;</span>
                    <span className={styles.postReadTime}>{post.read_time}</span>
                  </div>
                  <h3 className={styles.postTitle}>{post.title}</h3>
                  <p className={styles.postExcerpt}>{post.excerpt}</p>
                </div>

                {expanded === post.id ? (
                  <div className={styles.expandedContent}>
                    <div className={styles.postFullText}>
                      {post.content.split('\n').map((para, i) =>
                        para.trim() ? <p key={i}>{para}</p> : null
                      )}
                    </div>
                    <button
                      type="button"
                      className={styles.toggleBtn}
                      onClick={() => setExpanded(null)}
                      aria-expanded="true"
                    >
                      <span>Collapse Article</span>
                      <span aria-hidden="true">&uarr;</span>
                    </button>
                  </div>
                ) : (
                  <div className={styles.cardFooter}>
                    <button
                      type="button"
                      className={styles.toggleBtn}
                      onClick={() => setExpanded(post.id)}
                      aria-expanded="false"
                    >
                      <span>Read Full Article</span>
                      <span aria-hidden="true">&rarr;</span>
                    </button>
                  </div>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
