/** The steganography algorithms the app offers. PVD will join LSB here. */
export const Algorithm = {
  LSB: 'lsb',
} as const;
export type Algorithm = (typeof Algorithm)[keyof typeof Algorithm];

/** Every algorithm, in menu order. */
export const ALGORITHMS: readonly Algorithm[] = [Algorithm.LSB];

/** How each algorithm is named, and summed up in a line, in menus and page titles. */
export const ALGORITHM_INFO: Readonly<
  Record<Algorithm, { readonly name: string; readonly summary: string }>
> = {
  [Algorithm.LSB]: {
    name: 'LSB',
    summary:
      'Least significant bit: the message hides in chosen bits of each colour, by default the lowest.',
  },
};
