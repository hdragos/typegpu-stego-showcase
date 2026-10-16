import { configureStore, type ThunkAction, type UnknownAction } from '@reduxjs/toolkit';
import { CHANNEL_MASKS_SLICE } from '../constants/channelMasks';
import { Operation } from '../constants/operations';
import { channelMasksReducer } from '../features/channelMasks/channelMasksSlice';
import { decodeReducer } from '../features/decode/decodeSlice';
import { encodeReducer } from '../features/encode/encodeSlice';

/**
 * Make a store for the app's state: one slice per operation, and the channel masks both
 * share. Redux Toolkit's store comes with redux-thunk, so work that takes time, such as
 * encoding, is written as thunks. The app has one store, and each test can make its own.
 */
export function createAppStore() {
  return configureStore({
    reducer: {
      [Operation.ENCODE]: encodeReducer,
      [Operation.DECODE]: decodeReducer,
      [CHANNEL_MASKS_SLICE]: channelMasksReducer,
    },
  });
}

export const store = createAppStore();

export type AppStore = ReturnType<typeof createAppStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

/** A thunk: work that reads the state and dispatches actions, now or later. */
export type AppThunk<Result = void> = ThunkAction<Result, RootState, unknown, UnknownAction>;
