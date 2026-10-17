// A secret as bytes, and back. A text message is just its UTF-8 bytes, the way anyone
// using typegpu-stego would hide text. A file goes in a small envelope, which keeps its
// name and checks that it comes back intact:
//
//   magic      4 bytes    0xFF "FIL"
//   version    1 byte
//   checksum   32 bytes   SHA-256 of everything after it
//   name size  2 bytes    big-endian, in UTF-8 bytes
//   name       UTF-8
//   content    the rest

import { Problem } from '../constants/messages';
import {
  CHECKSUM_ALGORITHM,
  CHECKSUM_BYTES,
  FILE_FORMAT_VERSION,
  FILE_MAGIC,
  FILE_NAME_SIZE_BYTES,
  MAX_FILE_NAME_BYTES,
  SecretKind,
} from '../constants/secrets';
import { TEXT_ENCODING } from '../constants/text';

/** What the app hides in an image: a text message, or a file. */
export type Secret =
  | { readonly kind: typeof SecretKind.TEXT; readonly message: string }
  | {
      readonly kind: typeof SecretKind.FILE;
      readonly name: string;
      readonly content: Uint8Array<ArrayBuffer>;
    };

/** Thrown when an image holds hidden data that's neither UTF-8 text nor a file. */
export class NotTextError extends Error {
  constructor(options?: ErrorOptions) {
    super(Problem.NOT_TEXT, options);
    this.name = 'NotTextError';
  }
}

/** Thrown when an image holds a file that's damaged, or in a format this app can't read. */
export class UnreadableFileError extends Error {
  constructor() {
    super(Problem.UNREADABLE_FILE);
    this.name = 'UnreadableFileError';
  }
}

const VERSION_BYTES = 1;
const CHECKSUM_OFFSET = FILE_MAGIC.length + VERSION_BYTES;
/** Where the part the checksum covers starts: the name's size, then the name and the content. */
const CHECKED_OFFSET = CHECKSUM_OFFSET + CHECKSUM_BYTES;
const NAME_OFFSET = CHECKED_OFFSET + FILE_NAME_SIZE_BYTES;

export function textToBytes(message: string): Uint8Array<ArrayBuffer> {
  return new TextEncoder().encode(message);
}

/** Read bytes as UTF-8 text. Throws a {@link NotTextError} if they aren't. */
export function bytesToText(bytes: Uint8Array): string {
  try {
    return new TextDecoder(TEXT_ENCODING, { fatal: true }).decode(bytes);
  } catch (cause) {
    throw new NotTextError({ cause });
  }
}

/** How many bytes a file takes once packed: its content, its name and the envelope. */
export function packedFileSize(name: string, contentSize: number): number {
  return NAME_OFFSET + textToBytes(name).length + contentSize;
}

/** The bytes to hide for `secret`. */
export async function packSecret(secret: Secret): Promise<Uint8Array<ArrayBuffer>> {
  if (secret.kind === SecretKind.TEXT) {
    return textToBytes(secret.message);
  }
  const name = textToBytes(secret.name);
  if (name.length > MAX_FILE_NAME_BYTES) {
    throw new RangeError(Problem.FILE_NAME_TOO_LONG);
  }
  const packed = new Uint8Array(NAME_OFFSET + name.length + secret.content.length);
  packed.set(FILE_MAGIC);
  packed[FILE_MAGIC.length] = FILE_FORMAT_VERSION;
  new DataView(packed.buffer).setUint16(CHECKED_OFFSET, name.length);
  packed.set(name, NAME_OFFSET);
  packed.set(secret.content, NAME_OFFSET + name.length);
  packed.set(await checksum(packed.subarray(CHECKED_OFFSET)), CHECKSUM_OFFSET);
  return packed;
}

/**
 * Read the bytes found in an image as a secret: a file if they start with the file magic,
 * and text otherwise. Throws {@link UnreadableFileError} for a damaged file, and
 * {@link NotTextError} for bytes that are neither.
 */
export async function unpackSecret(bytes: Uint8Array): Promise<Secret> {
  if (!FILE_MAGIC.every((value, index) => bytes[index] === value)) {
    return { kind: SecretKind.TEXT, message: bytesToText(bytes) };
  }
  // A copy with its own memory, which WebCrypto needs.
  const packed = bytes.slice();
  if (packed.length < NAME_OFFSET || packed[FILE_MAGIC.length] !== FILE_FORMAT_VERSION) {
    throw new UnreadableFileError();
  }
  const actual = await checksum(packed.subarray(CHECKED_OFFSET));
  const expected = packed.subarray(CHECKSUM_OFFSET, CHECKED_OFFSET);
  if (!actual.every((value, index) => value === expected[index])) {
    throw new UnreadableFileError();
  }
  const nameEnd = NAME_OFFSET + new DataView(packed.buffer).getUint16(CHECKED_OFFSET);
  if (nameEnd > packed.length) {
    throw new UnreadableFileError();
  }
  return {
    kind: SecretKind.FILE,
    name: new TextDecoder(TEXT_ENCODING).decode(packed.subarray(NAME_OFFSET, nameEnd)),
    content: packed.slice(nameEnd),
  };
}

async function checksum(bytes: Uint8Array<ArrayBuffer>): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest(CHECKSUM_ALGORITHM, bytes));
}
