import type { ReactNode } from 'react';
import styles from './TwoPaneLayout.module.css';

interface TwoPaneLayoutProps {
  /** The wide pane, on the left: what the page works on. */
  readonly main: ReactNode;
  /** The narrow pane, on the right: the controls. */
  readonly side: ReactNode;
  /** Shown under both panes, across the full width. */
  readonly below?: ReactNode;
}

/** A wide pane and a narrow one side by side, stacked on small screens. */
export function TwoPaneLayout({ main, side, below }: TwoPaneLayoutProps) {
  return (
    <div className={styles.layout}>
      <div className={styles.panes}>
        <div className={styles.pane}>{main}</div>
        <div className={styles.pane}>{side}</div>
      </div>
      {below}
    </div>
  );
}
