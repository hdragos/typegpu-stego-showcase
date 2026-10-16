// The channel masks LSB encodes with: which bits of each colour carry the message.

/** The colour channels a message can be hidden in. Alpha never holds any of it. */
export const Channel = {
  RED: 'red',
  GREEN: 'green',
  BLUE: 'blue',
} as const;
export type Channel = (typeof Channel)[keyof typeof Channel];

/** Every channel, in the order the library takes their masks: red, green, blue. */
export const CHANNELS: readonly Channel[] = [Channel.RED, Channel.GREEN, Channel.BLUE];

/** Each channel's name on screen. */
export const CHANNEL_LABEL: Readonly<Record<Channel, string>> = {
  [Channel.RED]: 'Red',
  [Channel.GREEN]: 'Green',
  [Channel.BLUE]: 'Blue',
};

/**
 * One mask per channel. Bit i of a mask selects bit-plane i of its channel, from 0, the
 * lowest, to 7. An image decodes only with the masks it was encoded with.
 */
export type ChannelMasks = Readonly<Record<Channel, number>>;

/** The library's default, and the classic choice: the lowest bit of each channel. */
export const DEFAULT_CHANNEL_MASKS: ChannelMasks = {
  [Channel.RED]: 1,
  [Channel.GREEN]: 1,
  [Channel.BLUE]: 1,
};

/** Bits in a mask: one per bit-plane of a channel. */
export const BITS_PER_MASK = 8;

/** The smallest mask, which selects no bits. */
export const MIN_MASK = 0;

/** The largest mask, which selects every bit. */
export const MAX_MASK = (1 << BITS_PER_MASK) - 1;

/** Masks are also written in binary, with every bit shown, as in `00000101`. */
export const BINARY_RADIX = 2;
export const BINARY_PADDING = '0';

/** The name of the Redux slice that keeps the masks, which is also its key in the state. */
export const CHANNEL_MASKS_SLICE = 'channelMasks';
