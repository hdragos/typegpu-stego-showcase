import { Outlet } from 'react-router';
import { LIBRARY_URL, SHOWCASE_SOURCE_URL, TYPEGPU_URL } from '../constants/links';
import { AppToolbar } from './AppToolbar';
import styles from './Layout.module.css';

/** What every page shares: the toolbar on top, the page, and a footer. */
export function Layout() {
  return (
    <>
      <AppToolbar />
      <main className={styles.content}>
        <Outlet />
      </main>
      <footer className={styles.footer}>
        Your images never leave your device: nothing is uploaded. Made with{' '}
        <a href={LIBRARY_URL}>typegpu-stego</a> and <a href={TYPEGPU_URL}>TypeGPU</a>.{' '}
        <a href={SHOWCASE_SOURCE_URL}>Source code</a>.
      </footer>
    </>
  );
}
