// The heavy parts of the images on screen: their files and pixels. Redux keeps only plain
// data, so it holds an image's id, and the rest is looked up here by that id.

import type { PixelBuffer } from 'typegpu-stego';
import { Bug } from '../constants/messages';

/** What Redux keeps about an image on screen: plain data only. */
export interface ImageInfo {
  /** The id to look up the image's file and pixels by. */
  readonly id: string;
  readonly name: string;
  readonly width: number;
  readonly height: number;
  /** An object URL that shows the image. */
  readonly previewUrl: string;
}

/** What can be kept for an image. */
interface KeptParts {
  /** The image as a file, to download or decode. */
  readonly file?: Blob;
  /** Its pixels, to encode into. */
  readonly pixels?: PixelBuffer;
}

interface KeptImage extends KeptParts {
  readonly previewUrl: string;
}

const images = new Map<string, KeptImage>();

/** Keep an image's parts, and return the id to find them by, with a URL that shows `preview`. */
export function rememberImage(
  preview: Blob,
  parts: KeptParts,
): { readonly id: string; readonly previewUrl: string } {
  const id = crypto.randomUUID();
  const previewUrl = URL.createObjectURL(preview);
  images.set(id, { previewUrl, ...parts });
  return { id, previewUrl };
}

/** The pixels kept for image `id`. */
export function recallPixels(id: string): PixelBuffer {
  const pixels = images.get(id)?.pixels;
  if (pixels === undefined) {
    throw new Error(Bug.NO_PIXELS_KEPT);
  }
  return pixels;
}

/** The file kept for image `id`. */
export function recallFile(id: string): Blob {
  const file = images.get(id)?.file;
  if (file === undefined) {
    throw new Error(Bug.NO_FILE_KEPT);
  }
  return file;
}

/** Let go of an image's parts and its URL. Does nothing when there's no image. */
export function forgetImage(id: string | undefined): void {
  if (id === undefined) {
    return;
  }
  const image = images.get(id);
  if (image !== undefined) {
    URL.revokeObjectURL(image.previewUrl);
    images.delete(id);
  }
}
