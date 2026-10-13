import { useState } from 'react';
import { HidePanel } from './HidePanel';
import { RevealPanel, type RevealState } from './RevealPanel';
import { revealImage } from './stego';

/** The page's two tabs. */
const Tab = { HIDE: 'hide', REVEAL: 'reveal' } as const;
type Tab = (typeof Tab)[keyof typeof Tab];

const LIBRARY_URL = 'https://github.com/hdragos/typegpu-stego';
const TYPEGPU_URL = 'https://typegpu.com';

export function App() {
  const [tab, setTab] = useState<Tab>(Tab.HIDE);
  const [reveal, setReveal] = useState<RevealState | null>(null);

  async function startReveal(image: Blob, name: string) {
    if (reveal !== null) {
      URL.revokeObjectURL(reveal.previewUrl);
    }
    const previewUrl = URL.createObjectURL(image);
    setReveal({ name, previewUrl, outcome: null });
    setTab(Tab.REVEAL);
    const outcome = await revealImage(image);
    // Another image may have been picked in the meantime: only update the one still shown.
    setReveal((shown) => (shown?.previewUrl === previewUrl ? { ...shown, outcome } : shown));
  }

  return (
    <main>
      <header>
        <h1>Hidden in plain sight</h1>
        <p className="lead">
          Hide a secret message in an image, then reveal it again. Only the lowest bit of a colour
          can change, so the image looks the same. Everything happens in your browser, and large
          images are processed on your GPU when one is available.
        </p>
      </header>

      <nav className="tabs" aria-label="What to do">
        <button type="button" aria-pressed={tab === Tab.HIDE} onClick={() => setTab(Tab.HIDE)}>
          Hide a message
        </button>
        <button type="button" aria-pressed={tab === Tab.REVEAL} onClick={() => setTab(Tab.REVEAL)}>
          Reveal a message
        </button>
      </nav>

      <div hidden={tab !== Tab.HIDE}>
        <HidePanel onReveal={(png, name) => void startReveal(png, name)} />
      </div>
      <div hidden={tab !== Tab.REVEAL}>
        <RevealPanel state={reveal} onPick={(file) => void startReveal(file, file.name)} />
      </div>

      <footer>
        <p>
          Your images never leave your device: nothing is uploaded. Made with{' '}
          <a href={LIBRARY_URL}>typegpu-stego</a> and <a href={TYPEGPU_URL}>TypeGPU</a>.
        </p>
      </footer>
    </main>
  );
}
