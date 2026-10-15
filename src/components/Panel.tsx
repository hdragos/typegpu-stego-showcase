import { useId, type ReactNode } from 'react';
import styles from './Panel.module.css';

interface PanelProps {
  readonly title: string;
  /** Controls at the end of the title row. */
  readonly actions?: ReactNode;
  readonly children: ReactNode;
}

/** A titled card that groups related content and controls. */
export function Panel({ title, actions, children }: PanelProps) {
  const headingId = useId();
  return (
    <section className={styles.panel} aria-labelledby={headingId}>
      <header className={styles.header}>
        <h2 id={headingId} className={styles.title}>
          {title}
        </h2>
        {actions !== undefined && <div className={styles.actions}>{actions}</div>}
      </header>
      <div className={styles.body}>{children}</div>
    </section>
  );
}
