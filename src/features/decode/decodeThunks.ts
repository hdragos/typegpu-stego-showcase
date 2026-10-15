import { createAsyncThunk } from '@reduxjs/toolkit';
import type { PixelBuffer } from 'typegpu-stego';
import type { AppThunk, RootState } from '../../app/store';
import { ThunkType } from '../../constants/actions';
import type { Algorithm } from '../../constants/algorithms';
import { revealMessage } from '../../stego/codec';
import { forgetImage, recallFile, rememberImage, type ImageInfo } from '../../stego/imageStore';
import { readPixels } from '../../stego/images';
import { describeProblem } from '../../stego/problems';
import type { DecodeOutcome } from './decodeSlice';

interface DecodeImageArgs {
  readonly algorithm: Algorithm;
  readonly file: Blob;
  readonly name: string;
}

interface Decoded {
  /** The image, or null if it couldn't be read. */
  readonly image: ImageInfo | null;
  readonly outcome: DecodeOutcome;
}

/**
 * Read an image and decode its message. It never rejects: an image without a message is
 * an outcome to show, with the reason in plain words.
 */
export const decodeImage = createAsyncThunk<
  Decoded,
  DecodeImageArgs,
  { readonly state: RootState }
>(ThunkType.DECODE_IMAGE, async ({ algorithm, file, name }, { getState }) => {
  forgetImage(getState().decode.image?.id);
  let pixels: PixelBuffer;
  try {
    pixels = await readPixels(file);
  } catch (caught) {
    return { image: null, outcome: { found: false, problem: describeProblem(caught) } };
  }
  const { id, previewUrl } = rememberImage(file, { file });
  const image = { id, previewUrl, name, width: pixels.width, height: pixels.height };
  try {
    return { image, outcome: { found: true, message: await revealMessage(algorithm, pixels) } };
  } catch (caught) {
    return { image, outcome: { found: false, problem: describeProblem(caught) } };
  }
});

/** Decode the image just encoded on the encode page. */
export function decodeEncodedResult(algorithm: Algorithm): AppThunk {
  return (dispatch, getState) => {
    const result = getState().encode.result;
    if (result !== null) {
      void dispatch(decodeImage({ algorithm, file: recallFile(result.id), name: result.name }));
    }
  };
}
