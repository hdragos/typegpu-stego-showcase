import styles from './PageHeader.module.css';

interface PageHeaderProps {
  readonly title: string;
  readonly description: string;
}

/** A page's title, with a line saying what the page is for. */
export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.description}>{description}</p>
    </header>
  );
}
