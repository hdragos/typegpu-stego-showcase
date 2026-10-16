import { describe, it, expect } from 'vitest';
import { createPixelBuffer, MalformedStegoError, type PixelBuffer } from 'typegpu-stego';
import { Algorithm } from '../constants/algorithms';
import { Channel, DEFAULT_CHANNEL_MASKS, type ChannelMasks } from '../constants/channelMasks';
import { RGBA_CHANNELS } from '../constants/images';
import { bytesToText, getCodec, hideMessage, NotTextError, revealMessage } from './codec';

/** A small image with varied pixels. Node has no WebGPU, so the codec runs on the CPU. */
function makeImage(width: number, height: number): PixelBuffer {
  const data = new Uint8ClampedArray(width * height * RGBA_CHANNELS);
  for (let i = 0; i < data.length; i++) {
    data[i] = (i * 37 + 11) & 0xff;
  }
  return createPixelBuffer(data, width, height, RGBA_CHANNELS);
}

/** Masks for red, green and blue, in that order. */
function masks(red: number, green: number, blue: number): ChannelMasks {
  return { [Channel.RED]: red, [Channel.GREEN]: green, [Channel.BLUE]: blue };
}

describe('hideMessage and revealMessage', () => {
  it('round-trip a message in any language, with emoji', async () => {
    const codec = await getCodec(Algorithm.LSB, DEFAULT_CHANNEL_MASKS);
    const message = 'Meet at noon. Café ☕, 東京, Ελλάδα 🙂';
    const encoded = await hideMessage(codec, makeImage(64, 64), message);
    expect(await revealMessage(codec, encoded)).toBe(message);
  });

  it('round-trip a message with other channel masks', async () => {
    const codec = await getCodec(Algorithm.LSB, masks(3, 0, 129));
    const encoded = await hideMessage(codec, makeImage(64, 64), 'Meet at noon.');
    expect(await revealMessage(codec, encoded)).toBe('Meet at noon.');
  });

  it('find nothing with masks other than the ones a message was encoded with', async () => {
    const encoder = await getCodec(Algorithm.LSB, masks(3, 0, 129));
    const encoded = await hideMessage(encoder, makeImage(64, 64), 'Meet at noon.');
    const decoder = await getCodec(Algorithm.LSB, DEFAULT_CHANNEL_MASKS);
    await expect(revealMessage(decoder, encoded)).rejects.toBeInstanceOf(MalformedStegoError);
  });

  it('find nothing in an image without a message', async () => {
    const codec = await getCodec(Algorithm.LSB, DEFAULT_CHANNEL_MASKS);
    await expect(revealMessage(codec, makeImage(64, 64))).rejects.toBeInstanceOf(
      MalformedStegoError,
    );
  });
});

describe('getCodec', () => {
  it('reuses the codec while the masks stay the same', async () => {
    const codec = await getCodec(Algorithm.LSB, masks(1, 1, 1));
    expect(await getCodec(Algorithm.LSB, masks(1, 1, 1))).toBe(codec);
    expect(await getCodec(Algorithm.LSB, masks(7, 7, 7))).not.toBe(codec);
  });

  it('makes a codec with the masks asked for', async () => {
    const image = makeImage(64, 64);
    const oneBitEach = await getCodec(Algorithm.LSB, masks(1, 1, 1));
    const threeBitsEach = await getCodec(Algorithm.LSB, masks(7, 7, 7));
    expect(threeBitsEach.capacity(image)).toBeGreaterThan(oneBitEach.capacity(image));
  });
});

describe('bytesToText', () => {
  it('rejects bytes that are not UTF-8 text', () => {
    expect(() => bytesToText(new Uint8Array([0xff, 0xfe, 0xfd]))).toThrow(NotTextError);
  });
});
