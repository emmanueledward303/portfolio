'use client';

import React, { useEffect, useState } from 'react';
import styles from './About.module.css';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  read_time: string;
  slug: string;
}

export default function About() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const fetchPosts = () => {
      fetch('/api/blog')
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) setPosts(data);
        })
        .catch(() => {/* silently fail */ });
    };

    fetchPosts(); // initial load
    const interval = setInterval(fetchPosts, 30_000); // re-fetch every 30 s
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="about" className={styles.about} aria-labelledby="about-heading">
      <div className={`container ${styles.inner}`}>
        {/* Left: bio */}
        <div className={styles.bio}>
          <p className={styles.eyebrow}>About Me</p>
          <h2 id="about-heading" className={styles.heading}>
            Building at the intersection of data&nbsp;&amp;&nbsp;code.
          </h2>
          <p className={styles.body}>
            I&apos;m Edward Emmanuel, self-taught data analyst and software engineer.
            I don't just clean datasets I turn them into dashboards, scoring models,
            and apps people open more than once.
          </p>
          <p className={styles.body}>
            My background spans Python data pipelines, BI Tools , Excel , SQL analytics, and full-stack
            web development with React and Next.js. I care deeply about clear
            communication, honest metrics, and well-crafted interfaces.
          </p>
          <p className={styles.body}>
            Off the keyboard, you'll find me gaming, watching movies,
            or lost in whatever internet rabbit hole caught me that week.
          </p>

          <ul className={styles.statsList} aria-label="Quick facts">
            <li className={styles.statItem}>
              <span className={styles.statValue}>Nigeria</span>
              <span className={styles.statLabel}>Based in</span>
            </li>
            <li className={styles.statItem}>
              <span className={styles.statValue}>Remote & Hybrid</span>
              <span className={styles.statLabel}>Work preference</span>
            </li>
            <li className={styles.statItem}>
              <span className={styles.statValue}>Open</span>
              <span className={styles.statLabel}>To opportunities</span>
            </li>
          </ul>
        </div>

        {/* Right: blog posts */}
        <div className={styles.postsCol}>
          <p className={styles.eyebrow}>Writing</p>
          <h3 className={styles.postsHeading}>Thoughts &amp; Notes</h3>

          {posts.length === 0 ? (
            <p className={styles.empty}>No posts yet — check back soon.</p>
          ) : (
            <ul className={styles.postList} role="list">
              {posts.map((post) => (
                <li key={post.id} className={styles.postCard}>
                  <div className={styles.postMeta}>
                    <span className={styles.postDate}>{post.date}</span>
                    <span className={styles.postDot} aria-hidden="true">·</span>
                    <span className={styles.postReadTime}>{post.read_time}</span>
                  </div>
                  <h4 className={styles.postTitle}>{post.title}</h4>
                  <p className={styles.postExcerpt}>{post.excerpt}</p>

                  {expanded === post.id ? (
                    <>
                      <div className={styles.postContent}>
                        {post.content.split('\n').map((para, i) =>
                          para.trim() ? <p key={i}>{para}</p> : null
                        )}
                      </div>
                      <button
                        className={styles.readToggle}
                        onClick={() => setExpanded(null)}
                        aria-expanded="true"
                      >
                        Collapse ↑
                      </button>
                    </>
                  ) : (
                    <button
                      className={styles.readToggle}
                      onClick={() => setExpanded(post.id)}
                      aria-expanded="false"
                    >
                      Read more →
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
