# CLAUDE.md

A browser demo for [typegpu-stego](https://github.com/hdragos/typegpu-stego): hide a
message in an image, and reveal it again. It will be published with GitHub Pages.

- The library comes from the sibling folder through `link:../typegpu-stego`. Build it
  (`pnpm build` there) before working here.
- Follow the library's conventions, in its CLAUDE.md: plain English (Microsoft Writing
  Style Guide), no magic strings, one name per concept, and its PR sizes.
- Constants live in their own files: `src/constants/` for the app, and
  `src/components/constants.ts` for the generic components. Never inline a raw string
  that stands for a closed set or a platform value.
- Generic UI, such as buttons, dropdowns and panes, lives in `src/components/` and
  knows nothing about steganography. App code lives in `src/app/`, `src/features/` and
  `src/stego/`.
- App-wide state uses Redux (Redux Toolkit, whose store includes redux-thunk), never
  React Context. Redux keeps plain data only: files and pixels stay in
  `src/stego/imageStore.ts`, looked up by id.
- Everything runs in the browser. Images are never uploaded.
- Make sure that all checks pass before pushing: `pnpm run format:check`, `lint`,
  `typecheck`, `test` and `build`.
- Do not post reviews on GitHub unless specifically instructed.
