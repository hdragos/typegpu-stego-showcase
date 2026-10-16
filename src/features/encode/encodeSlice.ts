import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { AppThunk } from '../../app/store';
import { Operation } from '../../constants/operations';
import { Status } from '../../constants/status';
import { forgetImage, type ImageInfo } from '../../stego/imageStore';
import { channelMasksChanged } from '../channelMasks/channelMasksSlice';
import { encodeMessage, loadCarrier, measureCarrier } from './encodeThunks';

/** The image a message is encoded into, and what it can hold. */
export interface CarrierInfo extends ImageInfo {
  /** The longest message it can hold, in bytes. */
  readonly capacity: number;
  /** Whether transparent areas were filled with white before encoding. */
  readonly filledTransparency: boolean;
}

export interface EncodeState {
  readonly carrier: CarrierInfo | null;
  readonly message: string;
  /** The image with the message in it, once it's encoded. */
  readonly result: ImageInfo | null;
  readonly status: Status;
  readonly problem: string | null;
}

export const initialEncodeState: EncodeState = {
  carrier: null,
  message: '',
  result: null,
  status: Status.IDLE,
  problem: null,
};

const encodeSlice = createSlice({
  name: Operation.ENCODE,
  initialState: initialEncodeState,
  reducers: {
    messageChanged(state, action: PayloadAction<string>) {
      state.message = action.payload;
      // An image encoded with the old message no longer matches it.
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
      .addCase(encodeMessage.pending, (state) => {
        state.status = Status.ENCODING;
        state.problem = null;
      })
      .addCase(encodeMessage.fulfilled, (state, action) => {
        state.result = action.payload;
        state.status = Status.IDLE;
      })
      .addCase(encodeMessage.rejected, (state, action) => {
        state.status = Status.IDLE;
        state.problem = action.payload ?? action.error.message ?? null;
      });
  },
});

export const { messageChanged } = encodeSlice.actions;
export const encodeReducer = encodeSlice.reducer;

/** Change the message, and let go of an image encoded with the old one. */
export function changeMessage(message: string): AppThunk {
  return (dispatch, getState) => {
    forgetImage(getState().encode.result?.id);
    dispatch(messageChanged(message));
  };
}
