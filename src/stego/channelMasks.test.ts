import { describe, it, expect } from 'vitest';
import { Channel, DEFAULT_CHANNEL_MASKS, type ChannelMasks } from '../constants/channelMasks';
import { Problem } from '../constants/messages';
import {
  bitsPerPixel,
  formatMask,
  masksToTexts,
  parseMask,
  readMaskDraft,
  sameMasks,
  toLibraryMasks,
} from './channelMasks';

/** Masks for red, green and blue, in that order. */
function masks(red: number, green: number, blue: number): ChannelMasks {
  return { [Channel.RED]: red, [Channel.GREEN]: green, [Channel.BLUE]: blue };
}

describe('parseMask', () => {
  it('reads whole numbers from 0 to 255', () => {
    expect(parseMask('0')).toBe(0);
    expect(parseMask('255')).toBe(255);
    expect(parseMask(' 7 ')).toBe(7);
  });

  it('rejects anything else', () => {
    for (const text of ['', ' ', '256', '-1', '1.5', 'one']) {
      expect(parseMask(text)).toBeNull();
    }
  });
});

describe('readMaskDraft', () => {
  it('reads the masks typed in the boxes', () => {
    expect(readMaskDraft(masksToTexts(masks(3, 0, 128)))).toEqual({
      valid: true,
      masks: masks(3, 0, 128),
    });
  });

  it('says when a box holds no mask', () => {
    const texts = { ...masksToTexts(DEFAULT_CHANNEL_MASKS), [Channel.GREEN]: '300' };
    expect(readMaskDraft(texts)).toEqual({ valid: false, problem: Problem.MASK_OUT_OF_RANGE });
  });

  it('says when no bit is selected', () => {
    expect(readMaskDraft(masksToTexts(masks(0, 0, 0)))).toEqual({
      valid: false,
      problem: Problem.NO_BITS_SELECTED,
    });
  });
});

describe('bitsPerPixel', () => {
  it('counts every bit the masks select', () => {
    expect(bitsPerPixel(DEFAULT_CHANNEL_MASKS)).toBe(3);
    expect(bitsPerPixel(masks(255, 0, 5))).toBe(10);
  });
});

describe('toLibraryMasks', () => {
  it('lists the masks as red, green, blue', () => {
    expect(toLibraryMasks(masks(1, 2, 3))).toEqual([1, 2, 3]);
  });
});

describe('sameMasks', () => {
  it('compares every channel', () => {
    expect(sameMasks(masks(1, 2, 3), masks(1, 2, 3))).toBe(true);
    expect(sameMasks(masks(1, 2, 3), masks(1, 2, 4))).toBe(false);
  });
});

describe('formatMask', () => {
  it('shows all eight bits, the highest first', () => {
    expect(formatMask(5)).toBe('00000101');
    expect(formatMask(255)).toBe('11111111');
  });
});
