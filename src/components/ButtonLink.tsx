import type { AnchorHTMLAttributes } from 'react';
import { classNames } from './classNames';
import { ButtonVariant } from './constants';
import styles from './Button.module.css';

interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  readonly variant?: ButtonVariant;
}

/** A link that looks like a button, such as one that downloads a file. */
export function ButtonLink({
  variant = ButtonVariant.PRIMARY,
  className,
  ...rest
}: ButtonLinkProps) {
  return <a className={classNames(styles.button, styles[variant], className)} {...rest} />;
}
