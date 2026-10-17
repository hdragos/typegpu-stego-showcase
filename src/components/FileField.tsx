import { useId, type ReactNode } from 'react';
import { classNames } from './classNames';
import { ButtonVariant } from './constants';
import { FileButton } from './FileButton';
import styles from './FileField.module.css';

interface FileFieldProps {
  readonly label: string;
  /** The chosen file's name, or null before one is chosen. */
  readonly fileName: string | null;
  /** A line under the field, such as how much of the room the file takes. */
  readonly hint?: ReactNode;
  /** Marks the file as unacceptable, such as too big. */
  readonly invalid?: boolean;
  readonly disabled?: boolean;
  readonly onFile: (file: File) => void;
}

/** A labelled button to choose any file, with the name of the one chosen. */
export function FileField({
  label,
  fileName,
  hint,
  invalid = false,
  disabled,
  onFile,
}: FileFieldProps) {
  const labelId = useId();
  return (
    <div className={styles.field} role="group" aria-labelledby={labelId}>
      <span id={labelId} className={styles.label}>
        {label}
      </span>
      <div className={styles.choice}>
        <FileButton variant={ButtonVariant.SECONDARY} disabled={disabled} onFile={onFile}>
          {fileName === null ? 'Choose a file' : 'Change file'}
        </FileButton>
        <span className={classNames(styles.name, fileName === null && styles.none)}>
          {fileName ?? 'No file chosen'}
        </span>
      </div>
      {hint !== undefined && (
        <p className={classNames(styles.hint, invalid && styles.invalid)}>{hint}</p>
      )}
    </div>
  );
}
