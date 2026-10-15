import { createSlice } from '@reduxjs/toolkit';
import { Problem } from '../../constants/messages';
import { Operation } from '../../constants/operations';
import { Status } from '../../constants/status';
import type { ImageInfo } from '../../stego/imageStore';
import { decodeImage } from './decodeThunks';

/** What decoding an image found: its message, or why it has none. */
export type DecodeOutcome =
  | { readonly found: true; readonly message: string }
  | { readonly found: false; readonly problem: string };

export interface DecodeState {
  /** The image being decoded, once it's been read. */
  readonly image: ImageInfo | null;
  readonly outcome: DecodeOutcome | null;
  readonly status: Status;
}

export const initialDecodeState: DecodeState = {
  image: null,
  outcome: null,
  status: Status.IDLE,
};

const decodeSlice = createSlice({
  name: Operation.DECODE,
  initialState: initialDecodeState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(decodeImage.pending, (state) => {
        state.status = Status.DECODING;
        state.outcome = null;
      })
      .addCase(decodeImage.fulfilled, (state, action) => {
        state.image = action.payload.image;
        state.outcome = action.payload.outcome;
        state.status = Status.IDLE;
      })
      .addCase(decodeImage.rejected, (state, action) => {
        state.status = Status.IDLE;
        state.outcome = { found: false, problem: action.error.message ?? Problem.UNEXPECTED };
      });
  },
});

export const decodeReducer = decodeSlice.reducer;
