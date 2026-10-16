import { createAsyncThunk } from '@reduxjs/toolkit';
import type { PixelBuffer } from 'typegpu-stego';
import type { AppThunk, RootState } from '../../app/store';
import { ThunkType } from '../../constants/actions';
import type { Algorithm } from '../../constants/algorithms';
import type { ChannelMasks } from '../../constants/channelMasks';
import { getCodec, revealMessage } from '../../stego/codec';
import { forgetImage, recallFile, rememberImage, type ImageInfo } from '../../stego/imageStore';
import { readPixels } from '../../stego/images';
import { describeProblem } from '../../stego/problems';
import type { DecodeOutcome } from './decodeSlice';

interface ThunkConfig {
  readonly state: RootState;
}

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
export const decodeImage = createAsyncThunk<Decoded, DecodeImageArgs, ThunkConfig>(
  ThunkType.DECODE_IMAGE,
  async ({ algorithm, file, name }, { getState }) => {
    forgetImage(getState().decode.image?.id);
    let pixels: PixelBuffer;
    try {
      pixels = await readPixels(file);
    } catch (caught) {
      return { image: null, outcome: notFound(caught) };
    }
    const { id, previewUrl } = rememberImage(file, { file });
    const image = { id, previewUrl, name, width: pixels.width, height: pixels.height };
    return { image, outcome: await findMessage(algorithm, getState().channelMasks, pixels) };
  },
);

interface RedecodeImageArgs {
  readonly algorithm: Algorithm;
  readonly image: ImageInfo;
}

/** Decode the image on screen again, such as with new channel masks. It never rejects either. */
export const redecodeImage = createAsyncThunk<DecodeOutcome, RedecodeImageArgs, ThunkConfig>(
  ThunkType.REDECODE_IMAGE,
  async ({ algorithm, image }, { getState }) => {
    try {
      const pixels = await readPixels(recallFile(image.id));
      return await findMessage(algorithm, getState().channelMasks, pixels);
    } catch (caught) {
      return notFound(caught);
    }
  },
);

/** The message hidden in `pixels`, or why there's none. */
async function findMessage(
  algorithm: Algorithm,
  channelMasks: ChannelMasks,
  pixels: PixelBuffer,
): Promise<DecodeOutcome> {
  try {
    const codec = await getCodec(algorithm, channelMasks);
    return { found: true, message: await revealMessage(codec, pixels) };
  } catch (caught) {
    return notFound(caught);
  }
}

function notFound(caught: unknown): DecodeOutcome {
  return { found: false, problem: describeProblem(caught) };
}

/** Decode the image just encoded on the encode page. */
export function decodeEncodedResult(algorithm: Algorithm): AppThunk {
  return (dispatch, getState) => {
    const result = getState().encode.result;
    if (result !== null) {
      void dispatch(decodeImage({ algorithm, file: recallFile(result.id), name: result.name }));
    }
  };
}
