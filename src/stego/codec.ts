// Hiding text in images and reading it back, through typegpu-stego.

import {
  GpuBackendError,
  GpuLsbCodec,
  requestGpuDevice,
  type PixelBuffer,
  type StegoCodec,
} from 'typegpu-stego';
import { Algorithm } from '../constants/algorithms';
import type { ChannelMasks } from '../constants/channelMasks';
import { Problem } from '../constants/messages';
import { TEXT_ENCODING } from '../constants/text';
import { sameMasks, toLibraryMasks } from './channelMasks';

/** Thrown when an image holds hidden data that isn't UTF-8 text. */
export class NotTextError extends Error {
  constructor(options?: ErrorOptions) {
    super(Problem.NOT_TEXT, options);
    this.name = 'NotTextError';
  }
}

let device: Promise<GPUDevice | null> | undefined;

/** The page's GPU device, or null without one. It's looked for once, and every codec shares it. */
function getDevice(): Promise<GPUDevice | null> {
  device ??= requestGpuDevice();
  return device;
}

interface KeptCodec {
  readonly channelMasks: ChannelMasks;
  readonly codec: Promise<StegoCodec>;
}

/** The latest codec made for each algorithm. */
const codecs = new Map<Algorithm, KeptCodec>();

/**
 * The page's codec for `algorithm`, with these channel masks. A codec's first GPU calls
 * compile its kernels, so the latest one is kept, and reused while the masks stay the same.
 */
export function getCodec(algorithm: Algorithm, channelMasks: ChannelMasks): Promise<StegoCodec> {
  const kept = codecs.get(algorithm);
  if (kept !== undefined && sameMasks(kept.channelMasks, channelMasks)) {
    return kept.codec;
  }
  const codec = createCodec(algorithm, channelMasks);
  codecs.set(algorithm, { channelMasks, codec });
  return codec;
}

async function createCodec(algorithm: Algorithm, channelMasks: ChannelMasks): Promise<StegoCodec> {
  // The device is already found, so the codec is built from it, rather than through
  // createLsbCodec, which would look for another one.
  const gpuDevice = await getDevice();
  switch (algorithm) {
    case Algorithm.LSB:
      return new GpuLsbCodec({ channelMasks: toLibraryMasks(channelMasks) }, gpuDevice);
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
export function hideMessage(
  codec: StegoCodec,
  carrier: PixelBuffer,
  message: string,
): Promise<PixelBuffer> {
  return retryAfterGpuFailure(() => codec.encode(carrier, textToBytes(message)));
}

/** Read the message hidden in `image`. */
export async function revealMessage(codec: StegoCodec, image: PixelBuffer): Promise<string> {
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
