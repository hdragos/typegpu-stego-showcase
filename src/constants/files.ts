/** Results are saved as PNG: it's lossless, so the hidden bits survive. */
export const PNG_TYPE = 'image/png';

/** The file picker filter for images to encode into: any image the browser can open. */
export const ACCEPT_ANY_IMAGE = 'image/*';

/** The file picker filter for images to decode: only PNGs keep a message intact. */
export const ACCEPT_PNG = PNG_TYPE;

/** A file name's extension, with its dot, such as `.jpg`. */
export const FILE_EXTENSION = /\.[^.]*$/;

/** Added to an encoded image's name: `holiday.jpg` becomes `holiday-encoded.png`. */
export const ENCODED_NAME_SUFFIX = '-encoded';

export const PNG_EXTENSION = '.png';
