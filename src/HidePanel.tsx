import { useMemo, useState, type ChangeEvent } from 'react';
import { CapacityExceededError } from 'typegpu-stego';
import { readCarrier, toPng, UnreadableImageError, type CarrierImage } from './image';
import { drawSample } from './sample';
import { describeUnexpected, getCodec, hideMessage, textToBytes } from './stego';

interface HidePanelProps {
  /** Show a freshly made image on the Reveal tab, and read its message back. */
  readonly onReveal: (png: Blob, fileName: string) => void;
}

/** The finished image, with the message in it. */
interface HiddenImage {
  readonly png: Blob;
  readonly url: string;
  readonly fileName: string;
}

export function HidePanel({ onReveal }: HidePanelProps) {
  const [carrier, setCarrier] = useState<CarrierImage | null>(null);
  const [capacity, setCapacity] = useState(0);
  const [message, setMessage] = useState('');
  const [hidden, setHidden] = useState<HiddenImage | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  const messageBytes = useMemo(() => textToBytes(message).length, [message]);
  const busy = status !== null;
  const canHide = carrier !== null && messageBytes > 0 && messageBytes <= capacity && !busy;

  function forgetHidden() {
    if (hidden !== null) {
      URL.revokeObjectURL(hidden.url);
    }
    setHidden(null);
  }

  async function loadCarrier(getFile: () => Promise<File>) {
    setProblem(null);
    setStatus('Reading the image…');
    try {
      const next = await readCarrier(await getFile());
      const nextCapacity = (await getCodec()).capacity(next.pixels);
      if (carrier !== null) {
        URL.revokeObjectURL(carrier.previewUrl);
      }
      forgetHidden();
      setCarrier(next);
      setCapacity(nextCapacity);
    } catch (caught) {
      setProblem(describeHideProblem(caught));
    } finally {
      setStatus(null);
    }
  }

  function onFileChosen(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Clear the input, so choosing the same file again still counts as a change.
    event.target.value = '';
    if (file !== undefined) {
      void loadCarrier(() => Promise.resolve(file));
    }
  }

  function onMessageChange(event: ChangeEvent<HTMLTextAreaElement>) {
    setMessage(event.target.value);
    forgetHidden();
  }

  async function hide() {
    if (carrier === null) {
      return;
    }
    setProblem(null);
    setStatus('Hiding the message…');
    try {
      const png = await toPng(await hideMessage(carrier.pixels, message));
      forgetHidden();
      setHidden({ png, url: URL.createObjectURL(png), fileName: withMessageSuffix(carrier.name) });
    } catch (caught) {
      setProblem(describeHideProblem(caught));
    } finally {
      setStatus(null);
    }
  }

  return (
    <section className="panel" aria-label="Hide a message">
      <div className="step">
        <h2>1. Choose an image</h2>
        <p className="hint">A photo works best. Any format your browser can open.</p>
        <div className="row">
          <label className="button" aria-disabled={busy}>
            Choose an image
            <input
              type="file"
              accept="image/*"
              className="visually-hidden"
              onChange={onFileChosen}
              disabled={busy}
            />
          </label>
          <button
            type="button"
            className="secondary"
            onClick={() => void loadCarrier(drawSample)}
            disabled={busy}
          >
            Use a sample image
          </button>
        </div>
        {carrier !== null && (
          <figure>
            <img src={carrier.previewUrl} alt="The image the message will be hidden in" />
            <figcaption>
              {carrier.name}, {carrier.pixels.width} × {carrier.pixels.height} pixels. It can hold{' '}
              {formatBytes(capacity)}.
              {carrier.filledTransparency &&
                " Its transparent areas were filled with white, because hidden bits don't survive transparency in a browser."}
            </figcaption>
          </figure>
        )}
      </div>

      <div className="step">
        <h2>2. Write your message</h2>
        <textarea
          aria-label="Your message"
          placeholder={carrier === null ? 'Choose an image first' : 'Write a secret message'}
          value={message}
          onChange={onMessageChange}
          disabled={carrier === null}
          rows={5}
        />
        <p className={messageBytes > capacity ? 'hint warning' : 'hint'}>
          {formatBytes(messageBytes)} of {formatBytes(capacity)}
        </p>
        <button type="button" onClick={() => void hide()} disabled={!canHide}>
          Hide the message
        </button>
      </div>

      {hidden !== null && (
        <div className="step">
          <h2>3. Save the new image</h2>
          <figure>
            <img src={hidden.url} alt="The image with the message hidden in it" />
            <figcaption>It looks the same, but it now holds your message.</figcaption>
          </figure>
          <div className="row">
            <a className="button" href={hidden.url} download={hidden.fileName}>
              Download the image
            </a>
            <button
              type="button"
              className="secondary"
              onClick={() => onReveal(hidden.png, hidden.fileName)}
            >
              Read it back
            </button>
          </div>
          <p className="hint">
            Keep it as a PNG, and share it as a file. Apps that compress images, like most chat
            apps, destroy the message.
          </p>
        </div>
      )}

      {status !== null && (
        <p role="status" className="status">
          {status}
        </p>
      )}
      {problem !== null && (
        <p role="alert" className="problem">
          {problem}
        </p>
      )}
    </section>
  );
}

function formatBytes(count: number): string {
  return `${count.toLocaleString()} ${count === 1 ? 'byte' : 'bytes'}`;
}

/** `holiday.jpg` becomes `holiday-with-message.png`. */
function withMessageSuffix(name: string): string {
  return `${name.replace(/\.[^.]*$/, '')}-with-message.png`;
}

function describeHideProblem(caught: unknown): string {
  if (caught instanceof UnreadableImageError) {
    return caught.message;
  }
  if (caught instanceof CapacityExceededError) {
    return 'The message is too long for this image. Shorten it, or choose a bigger image.';
  }
  return describeUnexpected(caught);
}
