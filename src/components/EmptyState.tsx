import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

interface EmptyStateProps {
  readonly title: string;
  readonly description: string;
  /** What the user can do to fill the space. */
  readonly actions: ReactNode;
}

/** Fills a space that has nothing to show yet, and offers what to do about it. */
export function EmptyState({ title, description, actions }: EmptyStateProps) {
  return (
    <div className={styles.empty}>
      <p className={styles.title}>{title}</p>
      <p className={styles.description}>{description}</p>
      <div className={styles.actions}>{actions}</div>
    </div>
  );
}
