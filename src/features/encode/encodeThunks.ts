import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import { ThunkType } from '../../constants/actions';
import type { Algorithm } from '../../constants/algorithms';
import { Problem } from '../../constants/messages';
import { getCodec, hideMessage } from '../../stego/codec';
import { encodedFileName } from '../../stego/format';
import { forgetImage, recallPixels, rememberImage, type ImageInfo } from '../../stego/imageStore';
import { readCarrier, toPng } from '../../stego/images';
import { describeProblem } from '../../stego/problems';
import { drawSample } from '../../stego/sample';
import type { CarrierInfo } from './encodeSlice';

interface ThunkConfig {
  readonly state: RootState;
  /** A failed thunk rejects with a plain-words description of the problem. */
  readonly rejectValue: string;
}

interface LoadCarrierArgs {
  readonly algorithm: Algorithm;
  /** The image to encode into. Null draws the sample instead. */
  readonly file: File | null;
}

/** Read an image to encode a message into, and work out how much it can hold. */
export const loadCarrier = createAsyncThunk<CarrierInfo, LoadCarrierArgs, ThunkConfig>(
  ThunkType.LOAD_CARRIER,
  async ({ algorithm, file }, { getState, rejectWithValue }) => {
    try {
      const image = file ?? (await drawSample());
      const { pixels, filledTransparency } = await readCarrier(image);
      const capacity = (await getCodec(algorithm)).capacity(pixels);
      // A filled image looks different from its file, so show the pixels actually used.
      const preview = filledTransparency ? await toPng(pixels) : image;
      const previous = getState().encode;
      forgetImage(previous.carrier?.id);
      forgetImage(previous.result?.id);
      const { id, previewUrl } = rememberImage(preview, { pixels });
      return {
        id,
        previewUrl,
        name: image.name,
        width: pixels.width,
        height: pixels.height,
        capacity,
        filledTransparency,
      };
    } catch (caught) {
      return rejectWithValue(describeProblem(caught));
    }
  },
);

/** Encode the message into the carrier, and keep the result as a PNG. */
export const encodeMessage = createAsyncThunk<ImageInfo, Algorithm, ThunkConfig>(
  ThunkType.ENCODE_MESSAGE,
  async (algorithm, { getState, rejectWithValue }) => {
    try {
      const { carrier, message } = getState().encode;
      if (carrier === null) {
        return rejectWithValue(Problem.NO_IMAGE);
      }
      const encoded = await hideMessage(algorithm, recallPixels(carrier.id), message);
      const png = await toPng(encoded);
      forgetImage(getState().encode.result?.id);
      const { id, previewUrl } = rememberImage(png, { file: png });
      return {
        id,
        previewUrl,
        name: encodedFileName(carrier.name),
        width: encoded.width,
        height: encoded.height,
      };
    } catch (caught) {
      return rejectWithValue(describeProblem(caught));
    }
  },
);
