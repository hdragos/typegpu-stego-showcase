# Hidden in plain sight

Hide a secret message in an image, and reveal it again, in your browser. A showcase
for [typegpu-stego](https://github.com/hdragos/typegpu-stego), which hides data in the
lowest bits of an image's pixels, on the GPU through [TypeGPU](https://typegpu.com)
when one is available.

Everything runs in the browser: images are never uploaded.

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

## How it keeps the message intact

The message lives in the lowest bit of each colour, so anything that nudges pixel
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
