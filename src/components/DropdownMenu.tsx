import { useEffect, useId, useRef, useState, type FocusEvent, type KeyboardEvent } from 'react';
import { classNames } from './classNames';
import { DocumentEvent, Key } from './constants';
import styles from './DropdownMenu.module.css';

export interface DropdownItem {
  /** Unique within its menu. */
  readonly id: string;
  readonly label: string;
  /** A short line under the label. */
  readonly description?: string;
  /** Whether this item is the one on screen now. */
  readonly current?: boolean;
  readonly onSelect: () => void;
}

interface DropdownMenuProps {
  readonly label: string;
  readonly items: readonly DropdownItem[];
  /** Highlights the button, such as for the part of the app that's open. */
  readonly active?: boolean;
}

/** A button that opens a list of choices below it. */
export function DropdownMenu({ label, items, active = false }: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const listId = useId();

  // Close on a click anywhere else. Not every browser moves focus when a button is
  // clicked, so a blur alone would miss some of these clicks.
  useEffect(() => {
    if (!open) {
      return;
    }
    function closeIfOutside(event: PointerEvent) {
      if (event.target instanceof Node && !root.current?.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener(DocumentEvent.POINTER_DOWN, closeIfOutside);
    return () => document.removeEventListener(DocumentEvent.POINTER_DOWN, closeIfOutside);
  }, [open]);

  // Close when keyboard focus leaves the menu.
  function onBlur(event: FocusEvent<HTMLDivElement>) {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setOpen(false);
    }
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === Key.ESCAPE) {
      setOpen(false);
    }
  }

  function select(item: DropdownItem) {
    setOpen(false);
    item.onSelect();
  }

  return (
    <div ref={root} className={styles.menu} onBlur={onBlur} onKeyDown={onKeyDown}>
      <button
        type="button"
        className={classNames(styles.trigger, active && styles.active)}
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((wasOpen) => !wasOpen)}
      >
        {label}
        <span className={styles.chevron} aria-hidden="true" />
      </button>
      <ul id={listId} className={styles.list} hidden={!open}>
        {items.map((item) => (
          <li key={item.id}>
            <button
              type="button"
              className={classNames(styles.item, item.current && styles.current)}
              aria-current={item.current}
              onClick={() => select(item)}
            >
              <span className={styles.itemLabel}>{item.label}</span>
              {item.description !== undefined && (
                <span className={styles.itemDescription}>{item.description}</span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
