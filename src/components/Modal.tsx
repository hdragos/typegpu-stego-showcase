import { useEffect, useId, useRef, type ReactNode } from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  readonly title: string;
  /** A line under the title, saying what the dialog is for. */
  readonly description?: string;
  readonly open: boolean;
  /** Called once the dialog closes, including when the user presses Escape. */
  readonly onClose: () => void;
  /** Buttons along the bottom, such as Cancel and Apply. */
  readonly actions?: ReactNode;
  readonly children: ReactNode;
}

/**
 * A dialog over the page. While it's open, the rest of the page can't be used, and Escape
 * closes it. Keyboard focus moves into it when it opens, and back when it closes.
 */
export function Modal({ title, description, open, onClose, actions, children }: ModalProps) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  // Only showModal() makes a dialog modal: the `open` attribute would show it without
  // blocking the page.
  useEffect(() => {
    const element = dialog.current;
    if (element === null) {
      return;
    }
    if (open && !element.open) {
      element.showModal();
    } else if (!open && element.open) {
      element.close();
    }
  }, [open]);

  return (
    <dialog
      ref={dialog}
      className={styles.modal}
      aria-labelledby={titleId}
      aria-describedby={description === undefined ? undefined : descriptionId}
      onClose={onClose}
    >
      <h2 id={titleId} className={styles.title}>
        {title}
      </h2>
      {description !== undefined && (
        <p id={descriptionId} className={styles.description}>
          {description}
        </p>
      )}
      <div className={styles.body}>{children}</div>
      {actions !== undefined && <div className={styles.actions}>{actions}</div>}
    </dialog>
  );
}
