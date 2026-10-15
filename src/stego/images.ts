// Reading images into pixels, and saving pixels as PNG files, without disturbing the
// lowest bits of any pixel: that's where the message lives.

import { createPixelBuffer, type PixelBuffer } from 'typegpu-stego';
import { PNG_TYPE } from '../constants/files';
import {
  CONTEXT_2D,
  EXACT_DECODE,
  OPAQUE_ALPHA,
  RGBA_CHANNELS,
  TRANSPARENCY_FILL,
} from '../constants/images';
import { Problem } from '../constants/messages';

/** Thrown when the browser can't read a file as an image. */
export class UnreadableImageError extends Error {
  constructor(options?: ErrorOptions) {
    super(Problem.UNREADABLE_IMAGE, options);
    this.name = 'UnreadableImageError';
  }
}

/** The pixels of an image to encode into. */
export interface CarrierPixels {
  readonly pixels: PixelBuffer;
  /** Whether transparent areas had to be filled with white; see {@link readCarrier}. */
  readonly filledTransparency: boolean;
}

/**
 * Read an image to encode a message into.
 *
 * Transparent areas are filled with white first. A browser canvas can store partly
 * transparent pixels in a way that rounds their colours when the image is saved, which
 * would destroy the hidden bits. Opaque images come out exactly as they went in.
 */
export async function readCarrier(image: Blob): Promise<CarrierPixels> {
  const bitmap = await decode(image);
  try {
    const pixels = drawPixels(bitmap, false);
    if (isOpaque(pixels)) {
      return { pixels, filledTransparency: false };
    }
    return { pixels: drawPixels(bitmap, true), filledTransparency: true };
  } finally {
    bitmap.close();
  }
}

/** Read an image that may hold a message, pixel for pixel. */
export async function readPixels(image: Blob): Promise<PixelBuffer> {
  const bitmap = await decode(image);
  try {
    return drawPixels(bitmap, false);
  } finally {
    bitmap.close();
  }
}

/** Save RGBA pixels as a PNG file. */
export function toPng(pixels: PixelBuffer): Promise<Blob> {
  const canvas = new OffscreenCanvas(pixels.width, pixels.height);
  const imageData = new ImageData(new Uint8ClampedArray(pixels.data), pixels.width, pixels.height);
  context2d(canvas).putImageData(imageData, 0, 0);
  return canvas.convertToBlob({ type: PNG_TYPE });
}

/** The 2D context of `canvas`. */
export function context2d(canvas: OffscreenCanvas): OffscreenCanvasRenderingContext2D {
  const context = canvas.getContext(CONTEXT_2D);
  if (context === null) {
    throw new Error(Problem.NO_CANVAS);
  }
  return context;
}

async function decode(image: Blob): Promise<ImageBitmap> {
  try {
    return await createImageBitmap(image, EXACT_DECODE);
  } catch (cause) {
    throw new UnreadableImageError({ cause });
  }
}

function drawPixels(bitmap: ImageBitmap, fillTransparency: boolean): PixelBuffer {
  const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
  const context = context2d(canvas);
  if (fillTransparency) {
    context.fillStyle = TRANSPARENCY_FILL;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.drawImage(bitmap, 0, 0);
  const { data, width, height } = context.getImageData(0, 0, canvas.width, canvas.height);
  return createPixelBuffer(data, width, height, RGBA_CHANNELS);
}

function isOpaque(pixels: PixelBuffer): boolean {
  for (let alpha = RGBA_CHANNELS - 1; alpha < pixels.data.length; alpha += RGBA_CHANNELS) {
    if (pixels.data[alpha] !== OPAQUE_ALPHA) {
      return false;
    }
  }
  return true;
}
