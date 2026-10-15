import type { ButtonHTMLAttributes } from 'react';
import { classNames } from './classNames';
import { ButtonVariant } from './constants';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly variant?: ButtonVariant;
}

/** A button. It doesn't submit forms unless it's given `type="submit"`. */
export function Button({ variant = ButtonVariant.PRIMARY, className, ...rest }: ButtonProps) {
  return (
    <button
      type="button"
      className={classNames(styles.button, styles[variant], className)}
      {...rest}
    />
  );
}
