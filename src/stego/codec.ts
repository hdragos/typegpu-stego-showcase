// Hiding text in images and reading it back, through typegpu-stego.

import { createLsbCodec, GpuBackendError, type PixelBuffer, type StegoCodec } from 'typegpu-stego';
import { Algorithm } from '../constants/algorithms';
import { Problem } from '../constants/messages';
import { TEXT_ENCODING } from '../constants/text';

/** Thrown when an image holds hidden data that isn't UTF-8 text. */
export class NotTextError extends Error {
  constructor(options?: ErrorOptions) {
    super(Problem.NOT_TEXT, options);
    this.name = 'NotTextError';
  }
}

const codecs = new Map<Algorithm, Promise<StegoCodec>>();

/**
 * The page's codec for `algorithm`. Creating one looks for a GPU, and its first GPU calls
 * compile the kernels, so each is made once and reused.
 */
export function getCodec(algorithm: Algorithm): Promise<StegoCodec> {
  let codec = codecs.get(algorithm);
  if (codec === undefined) {
    codec = createCodec(algorithm);
    codecs.set(algorithm, codec);
  }
  return codec;
}

function createCodec(algorithm: Algorithm): Promise<StegoCodec> {
  switch (algorithm) {
    case Algorithm.LSB:
      return createLsbCodec();
  }
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
export async function hideMessage(
  algorithm: Algorithm,
  carrier: PixelBuffer,
  message: string,
): Promise<PixelBuffer> {
  const codec = await getCodec(algorithm);
  return retryAfterGpuFailure(() => codec.encode(carrier, textToBytes(message)));
}

/** Read the message hidden in `image`. */
export async function revealMessage(algorithm: Algorithm, image: PixelBuffer): Promise<string> {
  const codec = await getCodec(algorithm);
  return bytesToText(await retryAfterGpuFailure(() => codec.decode(image)));
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
