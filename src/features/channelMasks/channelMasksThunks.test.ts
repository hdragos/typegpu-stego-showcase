import { describe, it, expect, vi } from 'vitest';
import { createPixelBuffer, LsbCodec, type PixelBuffer } from 'typegpu-stego';
import { createAppStore, type AppStore } from '../../app/store';
import { Algorithm } from '../../constants/algorithms';
import { DEFAULT_CHANNEL_MASKS } from '../../constants/channelMasks';
import { RGBA_CHANNELS } from '../../constants/images';
import { mapChannels, toLibraryMasks } from '../../stego/channelMasks';
import { rememberImage } from '../../stego/imageStore';
import { loadCarrier } from '../encode/encodeThunks';
import { changeChannelMasks } from './channelMasksThunks';

const SIDE = 64;

/** A store with a carrier on the encode page, and the carrier's pixels. */
function storeWithCarrier(): { store: AppStore; pixels: PixelBuffer } {
  const store = createAppStore();
  const data = new Uint8ClampedArray(SIDE * SIDE * RGBA_CHANNELS);
  const pixels = createPixelBuffer(data, SIDE, SIDE, RGBA_CHANNELS);
  const { id, previewUrl } = rememberImage(new Blob(), { pixels });
  const carrier = {
    id,
    previewUrl,
    name: 'photo.png',
    width: SIDE,
    height: SIDE,
    capacity: 0,
    filledTransparency: false,
  };
  store.dispatch(
    loadCarrier.fulfilled(carrier, 'request', { algorithm: Algorithm.LSB, file: null }),
  );
  return { store, pixels };
}

describe('changeChannelMasks', () => {
  it('keeps the new masks, and works out again how much the carrier can hold', async () => {
    const { store, pixels } = storeWithCarrier();
    const threeBitsEach = mapChannels(() => 7);
    store.dispatch(changeChannelMasks(Algorithm.LSB, threeBitsEach));
    expect(store.getState().channelMasks).toEqual(threeBitsEach);
    const capacity = new LsbCodec({ channelMasks: toLibraryMasks(threeBitsEach) }).capacity(pixels);
    await vi.waitFor(() => expect(store.getState().encode.carrier?.capacity).toBe(capacity));
  });

  it('does nothing when the masks stay the same', () => {
    const { store } = storeWithCarrier();
    const before = store.getState();
    store.dispatch(changeChannelMasks(Algorithm.LSB, { ...DEFAULT_CHANNEL_MASKS }));
    expect(store.getState()).toBe(before);
  });
});
