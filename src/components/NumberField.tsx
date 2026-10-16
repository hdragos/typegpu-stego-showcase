import { useId, type InputHTMLAttributes, type ReactNode } from 'react';
import { classNames } from './classNames';
import styles from './NumberField.module.css';

interface NumberFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  readonly label: string;
  /** A line under the field, such as the numbers it takes. */
  readonly hint?: ReactNode;
  /** Marks the value as unacceptable, such as out of range. */
  readonly invalid?: boolean;
  /** More controls for the same value, shown under the box. */
  readonly children?: ReactNode;
}

/** A labelled box for a number, with any other controls for the same value under it. */
export function NumberField({
  label,
  hint,
  invalid = false,
  className,
  children,
  ...rest
}: NumberFieldProps) {
  const boxId = useId();
  const hintId = useId();
  return (
    <div className={styles.field}>
      <label htmlFor={boxId} className={styles.label}>
        {label}
      </label>
      <input
        id={boxId}
        type="number"
        inputMode="numeric"
        className={classNames(styles.box, className)}
        aria-invalid={invalid}
        aria-describedby={hint === undefined ? undefined : hintId}
        {...rest}
      />
      {children}
      {hint !== undefined && (
        <p id={hintId} className={classNames(styles.hint, invalid && styles.invalid)}>
          {hint}
        </p>
      )}
    </div>
  );
}
