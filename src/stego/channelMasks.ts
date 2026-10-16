// Reading, checking and showing channel masks.

import {
  BINARY_PADDING,
  BINARY_RADIX,
  BITS_PER_MASK,
  Channel,
  CHANNELS,
  MAX_MASK,
  MIN_MASK,
  type ChannelMasks,
} from '../constants/channelMasks';
import { Problem } from '../constants/messages';

/** What's typed in each channel's box, which may not be a mask yet. */
export type ChannelTexts = Readonly<Record<Channel, string>>;

/** The masks typed in the boxes, or what's wrong with them. */
export type MaskDraft =
  | { readonly valid: true; readonly masks: ChannelMasks }
  | { readonly valid: false; readonly problem: string };

/** One value per channel, each made by `make`. */
export function mapChannels<T>(make: (channel: Channel) => T): Record<Channel, T> {
  return {
    [Channel.RED]: make(Channel.RED),
    [Channel.GREEN]: make(Channel.GREEN),
    [Channel.BLUE]: make(Channel.BLUE),
  };
}

/** The mask typed in a box, or null if it isn't a whole number from 0 to 255. */
export function parseMask(text: string): number | null {
  if (text.trim().length === 0) {
    return null;
  }
  const mask = Number(text);
  return Number.isInteger(mask) && mask >= MIN_MASK && mask <= MAX_MASK ? mask : null;
}

/** Read the masks typed in the boxes. They're usable once each is a mask, and one selects a bit. */
export function readMaskDraft(texts: ChannelTexts): MaskDraft {
  const masks = mapChannels((channel) => parseMask(texts[channel]));
  if (!hasEveryMask(masks)) {
    return { valid: false, problem: Problem.MASK_OUT_OF_RANGE };
  }
  if (bitsPerPixel(masks) === 0) {
    return { valid: false, problem: Problem.NO_BITS_SELECTED };
  }
  return { valid: true, masks };
}

/** Whether every box holds a mask. */
function hasEveryMask(masks: Record<Channel, number | null>): masks is ChannelMasks {
  return CHANNELS.every((channel) => masks[channel] !== null);
}

/** The masks as text, one per box. */
export function masksToTexts(channelMasks: ChannelMasks): ChannelTexts {
  return mapChannels((channel) => String(channelMasks[channel]));
}

/** The masks as the library takes them: an array of red's, green's and blue's. */
export function toLibraryMasks(channelMasks: ChannelMasks): number[] {
  return CHANNELS.map((channel) => channelMasks[channel]);
}

/** Whether two sets of masks select the same bits. */
export function sameMasks(first: ChannelMasks, second: ChannelMasks): boolean {
  return CHANNELS.every((channel) => first[channel] === second[channel]);
}

/** How many bits of the message each pixel holds: all the bits the masks select. */
export function bitsPerPixel(channelMasks: ChannelMasks): number {
  return CHANNELS.reduce((total, channel) => total + selectedBits(channelMasks[channel]), 0);
}

function selectedBits(mask: number): number {
  let count = 0;
  for (let bit = 0; bit < BITS_PER_MASK; bit++) {
    count += (mask >> bit) & 1;
  }
  return count;
}

/** A mask in binary, the highest bit first, as in `00000101`. */
export function formatMask(mask: number): string {
  return mask.toString(BINARY_RADIX).padStart(BITS_PER_MASK, BINARY_PADDING);
}
