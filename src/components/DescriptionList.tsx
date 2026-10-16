import type { ReactNode } from 'react';
import styles from './DescriptionList.module.css';

export interface Description {
  /** Unique within its list. */
  readonly term: string;
  readonly details: ReactNode;
}

/** Terms and their details, such as settings and their values, one pair per row. */
export function DescriptionList({ items }: { readonly items: readonly Description[] }) {
  return (
    <dl className={styles.list}>
      {items.map((item) => (
        <div key={item.term} className={styles.item}>
          <dt className={styles.term}>{item.term}</dt>
          <dd className={styles.details}>{item.details}</dd>
        </div>
      ))}
    </dl>
  );
}
