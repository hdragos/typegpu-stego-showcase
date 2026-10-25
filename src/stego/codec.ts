// Hiding secrets in images and reading them back, through typegpu-stego.

import {
  GpuBackendError,
  GpuLsbCodec,
  requestGpuDevice,
  type PixelBuffer,
  type StegoCodec,
} from 'typegpu-stego';
import { Algorithm } from '../constants/algorithms';
import type { ChannelMasks } from '../constants/channelMasks';
import { sameMasks, toLibraryMasks } from './channelMasks';
import { packSecret, unpackSecret, type Secret } from './secrets';

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

/** Hide `secret` in a copy of `carrier`. */
export async function hideSecret(
  codec: StegoCodec,
  carrier: PixelBuffer,
  secret: Secret,
): Promise<PixelBuffer> {
  const payload = await packSecret(secret);
  return retryAfterGpuFailure(() => codec.encode(carrier, payload));
}

/** Read the secret hidden in `image`. */
export async function revealSecret(codec: StegoCodec, image: PixelBuffer): Promise<Secret> {
  return unpackSecret(await retryAfterGpuFailure(() => codec.decode(image)));
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
