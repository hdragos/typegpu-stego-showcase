import type { ReactNode } from 'react';
import styles from './Toolbar.module.css';

interface ToolbarProps {
  /** What the toolbar's navigation is called, for screen readers. */
  readonly label: string;
  /** The app's name or logo, at the start. */
  readonly brand: ReactNode;
  /** The main controls. */
  readonly children: ReactNode;
  /** Controls at the far end, such as links. */
  readonly end?: ReactNode;
}

/** A bar pinned to the top of the page, which stays in view while the page scrolls. */
export function Toolbar({ label, brand, children, end }: ToolbarProps) {
  return (
    <header className={styles.toolbar}>
      <div className={styles.brand}>{brand}</div>
      <nav className={styles.controls} aria-label={label}>
        {children}
      </nav>
      {end !== undefined && <div className={styles.end}>{end}</div>}
    </header>
  );
}
