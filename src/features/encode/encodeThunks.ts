import { createAsyncThunk } from '@reduxjs/toolkit';
import type { RootState } from '../../app/store';
import { ThunkType } from '../../constants/actions';
import type { Algorithm } from '../../constants/algorithms';
import { Problem } from '../../constants/messages';
import { SecretKind } from '../../constants/secrets';
import { getCodec, hideSecret } from '../../stego/codec';
import { encodedFileName } from '../../stego/format';
import { forgetImage, recallPixels, rememberImage, type ImageInfo } from '../../stego/imageStore';
import { readCarrier, toPng } from '../../stego/images';
import { describeProblem } from '../../stego/problems';
import { drawSample } from '../../stego/sample';
import { recallSecretFile } from '../../stego/secretFiles';
import type { Secret } from '../../stego/secrets';
import type { CarrierInfo, EncodeState } from './encodeSlice';

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

/** Read an image to encode a secret into, and work out how much it can hold. */
export const loadCarrier = createAsyncThunk<CarrierInfo, LoadCarrierArgs, ThunkConfig>(
  ThunkType.LOAD_CARRIER,
  async ({ algorithm, file }, { getState, rejectWithValue }) => {
    try {
      const image = file ?? (await drawSample());
      const { pixels, filledTransparency } = await readCarrier(image);
      const codec = await getCodec(algorithm, getState().channelMasks);
      const capacity = codec.capacity(pixels);
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

interface MeasureCarrierArgs {
  readonly algorithm: Algorithm;
  readonly carrierId: string;
}

interface MeasuredCarrier {
  readonly carrierId: string;
  /** The most it can hold, in bytes. */
  readonly capacity: number;
}

/** Work out again how much the carrier can hold, such as with new channel masks. */
export const measureCarrier = createAsyncThunk<MeasuredCarrier, MeasureCarrierArgs, ThunkConfig>(
  ThunkType.MEASURE_CARRIER,
  async ({ algorithm, carrierId }, { getState, rejectWithValue }) => {
    try {
      const codec = await getCodec(algorithm, getState().channelMasks);
      return { carrierId, capacity: codec.capacity(recallPixels(carrierId)) };
    } catch (caught) {
      return rejectWithValue(describeProblem(caught));
    }
  },
);

/** Hide the secret, the message or the file, in the carrier, and keep the result as a PNG. */
export const encodeSecret = createAsyncThunk<ImageInfo, Algorithm, ThunkConfig>(
  ThunkType.ENCODE_SECRET,
  async (algorithm, { getState, rejectWithValue }) => {
    try {
      const { carrier } = getState().encode;
      if (carrier === null) {
        return rejectWithValue(Problem.NO_IMAGE);
      }
      const secret = await currentSecret(getState().encode);
      if (secret === null) {
        return rejectWithValue(Problem.NO_FILE);
      }
      const codec = await getCodec(algorithm, getState().channelMasks);
      const encoded = await hideSecret(codec, recallPixels(carrier.id), secret);
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

/** The secret the encode page holds, or null when it's to hide a file and none is chosen. */
async function currentSecret({ secretKind, message, file }: EncodeState): Promise<Secret | null> {
  if (secretKind === SecretKind.TEXT) {
    return { kind: SecretKind.TEXT, message };
  }
  if (file === null) {
    return null;
  }
  const content = new Uint8Array(await recallSecretFile(file.id).arrayBuffer());
  return { kind: SecretKind.FILE, name: file.name, content };
}
