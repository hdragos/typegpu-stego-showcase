import { useId, type ReactNode, type TextareaHTMLAttributes } from 'react';
import { classNames } from './classNames';
import styles from './TextArea.module.css';

interface TextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  readonly label: string;
  /** A line under the box, such as a character count. */
  readonly hint?: ReactNode;
  /** Marks the value as unacceptable, such as too long. */
  readonly invalid?: boolean;
}

/** A labelled box for text that can run over several lines. */
export function TextArea({ label, hint, invalid = false, className, ...rest }: TextAreaProps) {
  const boxId = useId();
  const hintId = useId();
  return (
    <div className={styles.field}>
      <label htmlFor={boxId} className={styles.label}>
        {label}
      </label>
      <textarea
        id={boxId}
        className={classNames(styles.box, className)}
        aria-invalid={invalid}
        aria-describedby={hint === undefined ? undefined : hintId}
        {...rest}
      />
      {hint !== undefined && (
        <p id={hintId} className={classNames(styles.hint, invalid && styles.invalid)}>
          {hint}
        </p>
      )}
    </div>
  );
}
