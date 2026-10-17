import { describe, it, expect } from 'vitest';
import { Algorithm } from '../../constants/algorithms';
import { SecretKind } from '../../constants/secrets';
import { Status } from '../../constants/status';
import type { ImageInfo } from '../../stego/imageStore';
import { decodeReducer, initialDecodeState, type DecodeOutcome } from './decodeSlice';
import { redecodeImage } from './decodeThunks';

const image: ImageInfo = {
  id: 'image',
  name: 'photo-encoded.png',
  width: 4,
  height: 4,
  previewUrl: 'blob:image',
};
const notFound: DecodeOutcome = { found: false, problem: 'No message.' };
const found: DecodeOutcome = {
  found: true,
  secret: { kind: SecretKind.TEXT, message: 'Meet at noon.' },
};

describe('decodeReducer', () => {
  it('shows the outcome of decoding the image on screen again', () => {
    const args = { algorithm: Algorithm.LSB, image };
    const decoding = decodeReducer(
      { ...initialDecodeState, image, outcome: notFound },
      redecodeImage.pending('request', args),
    );
    expect(decoding).toMatchObject({ image, outcome: null, status: Status.DECODING });
    const decoded = decodeReducer(decoding, redecodeImage.fulfilled(found, 'request', args));
    expect(decoded).toMatchObject({ image, outcome: found, status: Status.IDLE });
  });

  it('ignores the outcome for an image no longer on screen', () => {
    const args = { algorithm: Algorithm.LSB, image: { ...image, id: 'another' } };
    const decoded = decodeReducer(
      { ...initialDecodeState, image, outcome: notFound, status: Status.DECODING },
      redecodeImage.fulfilled(found, 'request', args),
    );
    expect(decoded).toMatchObject({ image, outcome: notFound, status: Status.IDLE });
  });
});
