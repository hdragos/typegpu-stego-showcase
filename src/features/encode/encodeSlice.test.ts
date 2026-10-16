import { describe, it, expect } from 'vitest';
import { Algorithm } from '../../constants/algorithms';
import { Status } from '../../constants/status';
import { mapChannels } from '../../stego/channelMasks';
import { channelMasksChanged } from '../channelMasks/channelMasksSlice';
import { encodeReducer, initialEncodeState, messageChanged, type CarrierInfo } from './encodeSlice';
import { encodeMessage, loadCarrier, measureCarrier } from './encodeThunks';

const carrier: CarrierInfo = {
  id: 'carrier',
  name: 'photo.png',
  width: 4,
  height: 4,
  previewUrl: 'blob:carrier',
  capacity: 3,
  filledTransparency: false,
};
const result = {
  id: 'result',
  name: 'photo-encoded.png',
  width: 4,
  height: 4,
  previewUrl: 'blob:result',
};
const loadArgs = { algorithm: Algorithm.LSB, file: null };

describe('encodeReducer', () => {
  it('drops the encoded image when the message changes', () => {
    const next = encodeReducer({ ...initialEncodeState, carrier, result }, messageChanged('new'));
    expect(next.message).toBe('new');
    expect(next.result).toBeNull();
  });

  it('drops the encoded image, and keeps the carrier, when the channel masks change', () => {
    const next = encodeReducer(
      { ...initialEncodeState, carrier, result },
      channelMasksChanged(mapChannels(() => 3)),
    );
    expect(next).toMatchObject({ carrier, result: null });
  });

  it('shows a new carrier, and drops the image encoded into the old one', () => {
    const loading = encodeReducer(
      { ...initialEncodeState, result },
      loadCarrier.pending('request', loadArgs),
    );
    expect(loading.status).toBe(Status.READING_IMAGE);
    const loaded = encodeReducer(loading, loadCarrier.fulfilled(carrier, 'request', loadArgs));
    expect(loaded).toMatchObject({ carrier, result: null, status: Status.IDLE });
  });

  it('updates the capacity of the carrier it measured, and of no other', () => {
    const measured = (carrierId: string) =>
      measureCarrier.fulfilled({ carrierId, capacity: 9 }, 'request', {
        algorithm: Algorithm.LSB,
        carrierId,
      });
    const state = { ...initialEncodeState, carrier };
    expect(encodeReducer(state, measured(carrier.id)).carrier?.capacity).toBe(9);
    expect(encodeReducer(state, measured('another')).carrier?.capacity).toBe(3);
  });

  it('keeps the plain-words problem when encoding fails', () => {
    const failed = encodeReducer(
      { ...initialEncodeState, carrier },
      encodeMessage.rejected(null, 'request', Algorithm.LSB, 'Too long.'),
    );
    expect(failed).toMatchObject({ status: Status.IDLE, problem: 'Too long.', result: null });
  });
});
