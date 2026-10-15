import type { ReactNode } from 'react';
import { classNames } from './classNames';
import { NOTICE_ROLE, type NoticeKind } from './constants';
import styles from './Notice.module.css';

interface NoticeProps {
  readonly kind: NoticeKind;
  readonly children: ReactNode;
}

/** A short message about how work is going, or what went wrong, read out to screen readers. */
export function Notice({ kind, children }: NoticeProps) {
  return (
    <p role={NOTICE_ROLE[kind]} className={classNames(styles.notice, styles[kind])}>
      {children}
    </p>
  );
}
