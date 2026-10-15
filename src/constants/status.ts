/** What a page is busy with, if anything. */
export const Status = {
  IDLE: 'idle',
  READING_IMAGE: 'reading-image',
  ENCODING: 'encoding',
  DECODING: 'decoding',
} as const;
export type Status = (typeof Status)[keyof typeof Status];
