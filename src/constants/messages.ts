// Text the app's logic produces for the user. Static labels stay in the components that
// show them.

import { MAX_MASK, MIN_MASK } from './channelMasks';
import { Status } from './status';

/** What the app says while it works. It says nothing when idle. */
export const STATUS_MESSAGE: Readonly<Record<Status, string | null>> = {
  [Status.IDLE]: null,
  [Status.READING_IMAGE]: 'Reading the image…',
  [Status.ENCODING]: 'Encoding…',
  [Status.DECODING]: 'Decoding…',
};

/** What the app says when something goes wrong. */
export const Problem = {
  UNREADABLE_IMAGE: "That file isn't an image this browser can read.",
  NO_CANVAS: "This browser can't draw on a canvas.",
  NO_IMAGE: 'Choose an image first.',
  NO_FILE: 'Choose a file first.',
  TOO_BIG:
    "That doesn't fit in this image. Hide something smaller, choose a bigger image, or " +
    'select more bits in the channel masks.',
  NO_MESSAGE:
    "This image doesn't hold a message with these channel masks. If it was encoded with " +
    'others, change them to match. If not, the image may have changed since, for example ' +
    'by being saved as a JPEG or sent through a chat app.',
  NOT_TEXT: "This image holds hidden data, but it's neither text nor a file hidden by this app.",
  UNREADABLE_FILE:
    "This image holds a file, but it's damaged, or in a newer format than this app reads.",
  FILE_NAME_TOO_LONG: 'The file name is too long to hide.',
  MASK_OUT_OF_RANGE: `Each mask is a whole number from ${MIN_MASK} to ${MAX_MASK}.`,
  NO_BITS_SELECTED: 'Select at least one bit.',
  /** Starts the description of an error nobody planned for. */
  UNEXPECTED: 'Something went wrong:',
} as const;

/** Errors that mean the app has a bug, rather than anything the user did. */
export const Bug = {
  NO_PIXELS_KEPT: 'No pixels are kept for this image.',
  NO_FILE_KEPT: 'No file is kept for this image.',
  NO_SECRET_FILE_KEPT: 'No file is kept for this secret.',
} as const;

/** Said about an image whose transparent areas were filled before encoding. */
export const FILLED_TRANSPARENCY_NOTE =
  "Its transparent areas were filled with white, because hidden bits don't survive " +
  'transparency in a browser.';

/** The unit after a byte count, for one and for any other number. */
export const ByteUnit = {
  ONE: 'byte',
  MANY: 'bytes',
} as const;
