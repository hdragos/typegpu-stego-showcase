// What the app hides in an image: a text message, or a file.

/** What a secret is: a text message, or a file. */
export const SecretKind = {
  TEXT: 'text',
  FILE: 'file',
} as const;
export type SecretKind = (typeof SecretKind)[keyof typeof SecretKind];

/** Every kind of secret, in the order the encode page offers them. */
export const SECRET_KINDS: readonly SecretKind[] = [SecretKind.TEXT, SecretKind.FILE];

/** Each kind's name on screen. */
export const SECRET_KIND_LABEL: Readonly<Record<SecretKind, string>> = {
  [SecretKind.TEXT]: 'Text',
  [SecretKind.FILE]: 'File',
};

/**
 * How a hidden file starts: 0xFF, which UTF-8 text never contains, so a message is never
 * mistaken for a file, then "FIL".
 */
export const FILE_MAGIC: readonly number[] = [0xff, 0x46, 0x49, 0x4c];

/** The version of the file format, written after the magic. */
export const FILE_FORMAT_VERSION = 1;

/** The checksum that shows a file came back intact, as WebCrypto names it, and its size. */
export const CHECKSUM_ALGORITHM = 'SHA-256';
export const CHECKSUM_BYTES = 32;

/** A file name's size, in UTF-8 bytes, is written as a big-endian 16-bit number. */
export const FILE_NAME_SIZE_BYTES = 2;
export const MAX_FILE_NAME_BYTES = 2 ** (8 * FILE_NAME_SIZE_BYTES) - 1;

/**
 * The type a found file is saved as, whatever it is. A browser saves this type rather
 * than opening it, so a web page hidden in an image never runs inside the app.
 */
export const DOWNLOAD_TYPE = 'application/octet-stream';
