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

export default function ThoughtsAndNotes() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = () => {
      fetch('/api/blog')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setPosts(data);
        })
        .catch(() => {
          /* silently fail */
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
        {loading ? (
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
