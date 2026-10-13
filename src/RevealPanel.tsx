import type { ChangeEvent } from 'react';
import { PNG_TYPE } from './image';
import type { RevealOutcome } from './stego';

/** The image on the Reveal tab, and what reading it found. */
export interface RevealState {
  readonly name: string;
  readonly previewUrl: string;
  /** Null while the message is being read. */
  readonly outcome: RevealOutcome | null;
}

interface RevealPanelProps {
  readonly state: RevealState | null;
  readonly onPick: (file: File) => void;
}

export function RevealPanel({ state, onPick }: RevealPanelProps) {
  function onFileChosen(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Clear the input, so choosing the same file again still counts as a change.
    event.target.value = '';
    if (file !== undefined) {
      onPick(file);
    }
  }

  return (
    <section className="panel" aria-label="Reveal a message">
      <div className="step">
        <h2>Choose an image with a message in it</h2>
        <p className="hint">A PNG made on the Hide tab, or by typegpu-stego with its defaults.</p>
        <div className="row">
          <label className="button">
            Choose a PNG
            <input
              type="file"
              accept={PNG_TYPE}
              className="visually-hidden"
              onChange={onFileChosen}
            />
          </label>
        </div>
      </div>

      {state !== null && (
        <div className="step">
          <figure>
            <img src={state.previewUrl} alt="The image being read" />
            <figcaption>{state.name}</figcaption>
          </figure>
          <Outcome outcome={state.outcome} />
        </div>
      )}
    </section>
  );
}

function Outcome({ outcome }: { readonly outcome: RevealOutcome | null }) {
  if (outcome === null) {
    return (
      <p role="status" className="status">
        Reading the message…
      </p>
    );
  }
  if (!outcome.found) {
    return (
      <p role="alert" className="problem">
        {outcome.problem}
      </p>
    );
  }
  return (
    <>
      <h3>The hidden message</h3>
      <p className="message">{outcome.message}</p>
    </>
  );
}
