import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AppThunk } from '../../app/store';
import { Operation } from '../../constants/operations';
import { SecretKind } from '../../constants/secrets';
import { Status } from '../../constants/status';
import { forgetImage, type ImageInfo } from '../../stego/imageStore';
import { forgetSecretFile, rememberSecretFile, type SecretFileInfo } from '../../stego/secretFiles';
import { channelMasksChanged } from '../channelMasks/channelMasksSlice';
import { encodeSecret, loadCarrier, measureCarrier } from './encodeThunks';

/** The image a secret is encoded into, and what it can hold. */
export interface CarrierInfo extends ImageInfo {
  /** The most it can hold, in bytes. */
  readonly capacity: number;
  /** Whether transparent areas were filled with white before encoding. */
  readonly filledTransparency: boolean;
}

export interface EncodeState {
  readonly carrier: CarrierInfo | null;
  /** Whether the secret to hide is the message or the file. */
  readonly secretKind: SecretKind;
  readonly message: string;
  /** The file to hide, once one is chosen. */
  readonly file: SecretFileInfo | null;
  /** The image with the secret in it, once it's encoded. */
  readonly result: ImageInfo | null;
  readonly status: Status;
  readonly problem: string | null;
}

export const initialEncodeState: EncodeState = {
  carrier: null,
  secretKind: SecretKind.TEXT,
  message: '',
  file: null,
  result: null,
  status: Status.IDLE,
  problem: null,
};

const encodeSlice = createSlice({
  name: Operation.ENCODE,
  initialState: initialEncodeState,
  reducers: {
    secretKindChanged(state, action: PayloadAction<SecretKind>) {
      state.secretKind = action.payload;
      // An image encoded with the other secret no longer matches what's shown.
      state.result = null;
    },
    messageChanged(state, action: PayloadAction<string>) {
      state.message = action.payload;
      // An image encoded with the old message no longer matches it.
      state.result = null;
    },
    fileChosen(state, action: PayloadAction<SecretFileInfo>) {
      state.file = action.payload;
      // An image encoded with the old file no longer matches it.
      state.result = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(channelMasksChanged, (state) => {
        // An image encoded with the old masks no longer decodes with the new ones.
        state.result = null;
      })
      .addCase(loadCarrier.pending, (state) => {
        state.status = Status.READING_IMAGE;
        state.problem = null;
      })
      .addCase(loadCarrier.fulfilled, (state, action) => {
        state.carrier = action.payload;
        state.result = null;
        state.status = Status.IDLE;
      })
      .addCase(loadCarrier.rejected, (state, action) => {
        state.status = Status.IDLE;
        state.problem = action.payload ?? action.error.message ?? null;
      })
      .addCase(measureCarrier.fulfilled, (state, action) => {
        // The carrier may have changed while it was measured.
        if (state.carrier?.id === action.payload.carrierId) {
          state.carrier.capacity = action.payload.capacity;
        }
      })
      .addCase(measureCarrier.rejected, (state, action) => {
        state.problem = action.payload ?? action.error.message ?? null;
      })
      .addCase(encodeSecret.pending, (state) => {
        state.status = Status.ENCODING;
        state.problem = null;
      })
      .addCase(encodeSecret.fulfilled, (state, action) => {
        state.result = action.payload;
        state.status = Status.IDLE;
      })
      .addCase(encodeSecret.rejected, (state, action) => {
        state.status = Status.IDLE;
        state.problem = action.payload ?? action.error.message ?? null;
      });
  },
});

export const { secretKindChanged, messageChanged, fileChosen } = encodeSlice.actions;
export const encodeReducer = encodeSlice.reducer;

/** Switch between hiding the message and hiding the file. */
export function changeSecretKind(secretKind: SecretKind): AppThunk {
  return (dispatch, getState) => {
    forgetImage(getState().encode.result?.id);
    dispatch(secretKindChanged(secretKind));
  };
}

/** Change the message, and let go of an image encoded with the old one. */
export function changeMessage(message: string): AppThunk {
  return (dispatch, getState) => {
    forgetImage(getState().encode.result?.id);
    dispatch(messageChanged(message));
  };
}

/** Choose the file to hide, and let go of the old one, and of the image encoded with it. */
export function chooseFile(file: File): AppThunk {
  return (dispatch, getState) => {
    const { file: previous, result } = getState().encode;
    forgetSecretFile(previous?.id);
    forgetImage(result?.id);
    dispatch(fileChosen(rememberSecretFile(file, file.name)));
  };
}
