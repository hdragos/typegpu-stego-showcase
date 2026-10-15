/** Bytes per pixel in what a canvas hands out: red, green, blue and alpha. */
export const RGBA_CHANNELS = 4;

/** The alpha of a fully opaque pixel. */
export const OPAQUE_ALPHA = 255;

/** The kind of canvas context the app draws with. */
export const CONTEXT_2D = '2d';

/**
 * Decode images exactly as stored. Colour management would nudge pixel values, and
 * premultiplied alpha would round them, and either destroys hidden bits.
 */
export const EXACT_DECODE: ImageBitmapOptions = {
  colorSpaceConversion: 'none',
  premultiplyAlpha: 'none',
};

/** What transparent areas are filled with before encoding: white, as most viewers show them. */
export const TRANSPARENCY_FILL = '#ffffff';
