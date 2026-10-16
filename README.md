# Hidden in plain sight

Hide a secret message in an image, and reveal it again, in your browser. A showcase
for [typegpu-stego](https://github.com/hdragos/typegpu-stego), which hides data in the
lowest bits of an image's pixels, on the GPU through [TypeGPU](https://typegpu.com)
when one is available.

The toolbar has an Encode and a Decode menu, and each lists the algorithms it can
use: LSB for now, with PVD to follow. Everything runs in the browser: images are
never uploaded.

Both pages share the channel masks: which bits of red, green and blue hold the
message. The default, 1, 1, 1, is the lowest bit of each. Change them by number, or
bit by bit. An image decodes only with the masks it was encoded with.

To compare an encoded image with the original, switch on its onion skin, as in
GitHub's image diffs. It lays the encoded image over the original, with a slider to
fade from one to the other.

## Running it

The app uses the library from a sibling folder, so clone both side by side, and build
the library first:

```bash
git clone https://github.com/hdragos/typegpu-stego.git
git clone https://github.com/hdragos/typegpu-stego-showcase.git
cd typegpu-stego
pnpm install
pnpm build
cd ../typegpu-stego-showcase
pnpm install
pnpm dev
```

## Project layout

- `src/app/`: the Redux store, the router, and the layout every page shares, with its
  toolbar.
- `src/features/`: one folder per page, `encode/` and `decode/`, each with its Redux
  slice and thunks, and `channelMasks/`, for the masks both pages share.
- `src/components/`: generic UI, such as buttons, dropdown menus, panes and the image
  viewer. It knows nothing about steganography.
- `src/stego/`: the app's logic that isn't UI: the codec, reading and saving images,
  and the sample image.
- `src/constants/`: the app's constants, one file per kind.

Pages live after a `#`, as in `/#/encode/lsb`, so any static host can serve them all
from the one `index.html`.

## How it keeps the message intact

The message lives in the bits the channel masks select, so anything that nudges pixel
values destroys it. The app avoids the three ways a browser can do that:

- **Colour management.** Images are decoded with colour conversion off, so the pixels
  are exactly the file's.
- **Transparency.** A browser canvas can round the colours of partly transparent
  pixels when it saves them. So before hiding a message, the app fills transparent
  areas with white.
- **Lossy formats.** The result is always saved as a PNG, which is lossless. A JPEG,
  or an app that recompresses images, destroys the message.

## Checks

Run these before pushing:

```bash
pnpm run format:check
pnpm run lint
pnpm run typecheck
pnpm run test
pnpm run build
```
