// Hiding text in images and reading it back, through typegpu-stego.

import {
  createLsbCodec,
  GpuBackendError,
  MalformedStegoError,
  type GpuLsbCodec,
  type PixelBuffer,
} from 'typegpu-stego';
import { readPixels, UnreadableImageError } from './image';

/** Messages are stored as UTF-8, so any language and emoji work. */
const TEXT_ENCODING = 'utf-8';

/** Thrown when an image holds hidden data that isn't UTF-8 text. */
export class NotTextError extends Error {
  constructor(options?: ErrorOptions) {
    super("This image holds hidden data, but it isn't text.", options);
    this.name = 'NotTextError';
  }
}

/** What reading an image's message found: the message, or why there isn't one. */
export type RevealOutcome =
  | { readonly found: true; readonly message: string }
  | { readonly found: false; readonly problem: string };

let codec: Promise<GpuLsbCodec> | undefined;

/**
 * The page's one codec. Creating it looks for a GPU, and its first GPU calls compile the
 * kernels, so it's made once and reused.
 */
export function getCodec(): Promise<GpuLsbCodec> {
  codec ??= createLsbCodec();
  return codec;
}

export function textToBytes(message: string): Uint8Array {
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

/** Hide `message` in a copy of `carrier`. */
export async function hideMessage(carrier: PixelBuffer, message: string): Promise<PixelBuffer> {
  const activeCodec = await getCodec();
  return retryAfterGpuFailure(() => activeCodec.encode(carrier, textToBytes(message)));
}

/** Read the message hidden in `image`. */
export async function revealMessage(image: PixelBuffer): Promise<string> {
  const activeCodec = await getCodec();
  return bytesToText(await retryAfterGpuFailure(() => activeCodec.decode(image)));
}

/** Read the message hidden in an image file, or say in plain words why there isn't one. */
export async function revealImage(file: Blob): Promise<RevealOutcome> {
  try {
    return { found: true, message: await revealMessage(await readPixels(file)) };
  } catch (caught) {
    return { found: false, problem: describeRevealProblem(caught) };
  }
}

/** Describe an error nobody planned for, and log it for whoever debugs it. */
export function describeUnexpected(caught: unknown): string {
  console.error(caught);
  const detail = caught instanceof Error ? caught.message : String(caught);
  return `Something went wrong: ${detail}`;
}

function describeRevealProblem(caught: unknown): string {
  if (caught instanceof UnreadableImageError || caught instanceof NotTextError) {
    return caught.message;
  }
  if (caught instanceof MalformedStegoError) {
    return (
      "This image doesn't hold a message. If it did, the image may have changed since, " +
      'for example by being saved as a JPEG or sent through a chat app.'
    );
  }
  return describeUnexpected(caught);
}

/**
 * Run `call`, and once more if the GPU failed. When the GPU device is lost, the call
 * running at that moment fails, and the codec runs every later call on the CPU.
 */
async function retryAfterGpuFailure<T>(call: () => Promise<T>): Promise<T> {
  try {
    return await call();
  } catch (caught) {
    if (caught instanceof GpuBackendError) {
      return call();
    }
    throw caught;
  }
}
