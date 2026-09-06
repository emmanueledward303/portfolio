import React from 'react';
import Link from 'next/link';
import styles from './Breadcrumb.module.css';

export interface BreadcrumbItem {
  label: string;
  href?: string; // omit for the current page (last item)
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

/**
 * Accessible breadcrumb navigation.
 *
 * - Wrapped in <nav aria-label="Breadcrumb"> per WCAG 2.4.8
 * - Uses <ol> (ordered list) — semantically correct for a path sequence
 * - aria-current="page" on the last item for screen reader context
 * - Separator (›) is aria-hidden so it is not announced
 */
export default function Breadcrumb({ items }: BreadcrumbProps) {
  if (!items || items.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className={styles.breadcrumb}>
      <ol className={styles.list} role="list">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={index} className={styles.item}>
              {!isLast && item.href ? (
                <>
                  <Link
                    href={item.href}
                    className={styles.link}
                  >
                    {item.label}
                  </Link>
                  {/* Separator — hidden from screen readers */}
                  <span className={styles.separator} aria-hidden="true">›</span>
                </>
              ) : (
                <span
                  className={styles.current}
                  aria-current="page"
                >
                  {item.label}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
