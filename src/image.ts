// Reading images into pixels, and saving pixels as PNG files, without disturbing the
// lowest bits of any pixel: that's where the message lives.

import { createPixelBuffer, type PixelBuffer } from 'typegpu-stego';

/** Bytes per pixel in what a canvas hands out: red, green, blue and alpha. */
const RGBA_CHANNELS = 4;

/** The alpha of a fully opaque pixel. */
const OPAQUE = 255;

/** Images are saved as PNG: it's lossless, so the hidden bits survive. */
export const PNG_TYPE = 'image/png';

/** The kind of canvas context used everywhere here. */
const CONTEXT_2D = '2d';

/**
 * Decode images exactly as stored. Colour management would nudge pixel values, and
 * premultiplied alpha would round them, and either destroys hidden bits.
 */
const EXACT_DECODE: ImageBitmapOptions = {
  colorSpaceConversion: 'none',
  premultiplyAlpha: 'none',
};

/** What transparent areas are filled with: white, as most image viewers show them. */
const FILL_COLOUR = '#ffffff';

/** Thrown when the browser can't read a file as an image. */
export class UnreadableImageError extends Error {
  constructor(options?: ErrorOptions) {
    super("That file isn't an image this browser can read.", options);
    this.name = 'UnreadableImageError';
  }
}

/** An image read and ready to hide a message in. */
export interface CarrierImage {
  readonly name: string;
  readonly pixels: PixelBuffer;
  /** An object URL to show the image with. Revoke it when the image is no longer shown. */
  readonly previewUrl: string;
  /** Whether transparent areas had to be filled with white; see {@link readCarrier}. */
  readonly filledTransparency: boolean;
}

/**
 * Read an image to hide a message in.
 *
 * Transparent areas are filled with white first. A browser canvas can store partly
 * transparent pixels in a way that rounds their colours when the image is saved, which
 * would destroy the hidden bits. Opaque images come out exactly as they went in.
 */
export async function readCarrier(file: File): Promise<CarrierImage> {
  const bitmap = await decode(file);
  try {
    let pixels = drawPixels(bitmap, false);
    const filledTransparency = !isOpaque(pixels);
    if (filledTransparency) {
      pixels = drawPixels(bitmap, true);
    }
    // A filled image looks different from the file, so show the pixels actually used.
    const preview = filledTransparency ? await toPng(pixels) : file;
    return {
      name: file.name,
      pixels,
      previewUrl: URL.createObjectURL(preview),
      filledTransparency,
    };
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
    throw new Error("This browser can't draw on a canvas.");
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
    context.fillStyle = FILL_COLOUR;
    context.fillRect(0, 0, canvas.width, canvas.height);
  }
  context.drawImage(bitmap, 0, 0);
  const { data, width, height } = context.getImageData(0, 0, canvas.width, canvas.height);
  return createPixelBuffer(data, width, height, RGBA_CHANNELS);
}

function isOpaque(pixels: PixelBuffer): boolean {
  for (
    let alphaIndex = RGBA_CHANNELS - 1;
    alphaIndex < pixels.data.length;
    alphaIndex += RGBA_CHANNELS
  ) {
    if (pixels.data[alphaIndex] !== OPAQUE) {
      return false;
    }
  }
  return true;
}
