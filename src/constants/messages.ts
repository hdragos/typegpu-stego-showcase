// Text the app's logic produces for the user. Static labels stay in the components that
// show them.

import { Status } from './status';

/** What the app says while it works. It says nothing when idle. */
export const STATUS_MESSAGE: Readonly<Record<Status, string | null>> = {
  [Status.IDLE]: null,
  [Status.READING_IMAGE]: 'Reading the image…',
  [Status.ENCODING]: 'Encoding the message…',
  [Status.DECODING]: 'Decoding the message…',
};

/** What the app says when something goes wrong. */
export const Problem = {
  UNREADABLE_IMAGE: "That file isn't an image this browser can read.",
  NO_CANVAS: "This browser can't draw on a canvas.",
  NO_IMAGE: 'Choose an image first.',
  MESSAGE_TOO_LONG: 'The message is too long for this image. Shorten it, or choose a bigger image.',
  NO_MESSAGE:
    "This image doesn't hold a message. If it did, the image may have changed since, for " +
    'example by being saved as a JPEG or sent through a chat app.',
  NOT_TEXT: "This image holds hidden data, but it isn't text.",
  /** Starts the description of an error nobody planned for. */
  UNEXPECTED: 'Something went wrong:',
} as const;

/** Errors that mean the app has a bug, rather than anything the user did. */
export const Bug = {
  NO_PIXELS_KEPT: 'No pixels are kept for this image.',
  NO_FILE_KEPT: 'No file is kept for this image.',
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
