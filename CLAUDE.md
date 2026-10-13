# CLAUDE.md

A browser demo for [typegpu-stego](https://github.com/hdragos/typegpu-stego): hide a
message in an image, and reveal it again. It will be published with GitHub Pages.

- The library comes from the sibling folder through `link:../typegpu-stego`. Build it
  (`pnpm build` there) before working here.
- Follow the library's conventions, in its CLAUDE.md: plain English (Microsoft Writing
  Style Guide), no magic strings, one name per concept, and its PR sizes.
- Everything runs in the browser. Images are never uploaded.
- Make sure that all checks pass before pushing: `pnpm run format:check`, `lint`,
  `typecheck`, `test` and `build`.
- Do not post reviews on GitHub unless specifically instructed.
