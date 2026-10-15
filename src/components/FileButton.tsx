import { useRef, type ChangeEvent, type ReactNode } from 'react';
import { Button } from './Button';
import type { ButtonVariant } from './constants';

interface FileButtonProps {
  /** Which files to offer, as in a file input's `accept` attribute. */
  readonly accept: string;
  readonly onFile: (file: File) => void;
  readonly children: ReactNode;
  readonly variant?: ButtonVariant;
  readonly disabled?: boolean;
}

/** A button that opens the browser's file picker, and hands over the file chosen. */
export function FileButton({ accept, onFile, children, variant, disabled }: FileButtonProps) {
  const input = useRef<HTMLInputElement>(null);

  function onChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Clear the input, so choosing the same file again still counts as a change.
    event.target.value = '';
    if (file !== undefined) {
      onFile(file);
    }
  }

  return (
    <>
      <Button variant={variant} disabled={disabled} onClick={() => input.current?.click()}>
        {children}
      </Button>
      <input ref={input} type="file" accept={accept} hidden onChange={onChange} />
    </>
  );
}
