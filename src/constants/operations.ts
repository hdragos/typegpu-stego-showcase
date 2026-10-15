/** What the app does with an image: hide a message in it, or read one out of it. */
export const Operation = {
  ENCODE: 'encode',
  DECODE: 'decode',
} as const;
export type Operation = (typeof Operation)[keyof typeof Operation];

/** Every operation, in toolbar order. */
export const OPERATIONS: readonly Operation[] = [Operation.ENCODE, Operation.DECODE];

/** Each operation's name, in the toolbar and in page titles. */
export const OPERATION_LABEL: Readonly<Record<Operation, string>> = {
  [Operation.ENCODE]: 'Encode',
  [Operation.DECODE]: 'Decode',
};
