import type { ReactNode } from 'react';
import styles from './FieldRow.module.css';

/** Fields side by side, wrapping onto more rows when there isn't room. */
export function FieldRow({ children }: { readonly children: ReactNode }) {
  return <div className={styles.row}>{children}</div>;
}
