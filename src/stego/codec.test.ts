import { describe, it, expect } from 'vitest';
import { createPixelBuffer, MalformedStegoError, type PixelBuffer } from 'typegpu-stego';
import { Algorithm } from '../constants/algorithms';
import { RGBA_CHANNELS } from '../constants/images';
import { bytesToText, hideMessage, NotTextError, revealMessage } from './codec';

/** A small image with varied pixels. Node has no WebGPU, so the codec runs on the CPU. */
function makeImage(width: number, height: number): PixelBuffer {
  const data = new Uint8ClampedArray(width * height * RGBA_CHANNELS);
  for (let i = 0; i < data.length; i++) {
    data[i] = (i * 37 + 11) & 0xff;
  }
  return createPixelBuffer(data, width, height, RGBA_CHANNELS);
}

describe('hideMessage and revealMessage', () => {
  it('round-trip a message in any language, with emoji', async () => {
    const message = 'Meet at noon. Café ☕, 東京, Ελλάδα 🙂';
    const encoded = await hideMessage(Algorithm.LSB, makeImage(64, 64), message);
    expect(await revealMessage(Algorithm.LSB, encoded)).toBe(message);
  });

  it('find nothing in an image without a message', async () => {
    await expect(revealMessage(Algorithm.LSB, makeImage(64, 64))).rejects.toBeInstanceOf(
      MalformedStegoError,
    );
  });
});

describe('bytesToText', () => {
  it('rejects bytes that are not UTF-8 text', () => {
    expect(() => bytesToText(new Uint8Array([0xff, 0xfe, 0xfd]))).toThrow(NotTextError);
  });
});
