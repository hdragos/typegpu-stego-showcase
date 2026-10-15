import { configureStore, type ThunkAction, type UnknownAction } from '@reduxjs/toolkit';
import { Operation } from '../constants/operations';
import { decodeReducer } from '../features/decode/decodeSlice';
import { encodeReducer } from '../features/encode/encodeSlice';

/**
 * The app's state, one slice per operation. Redux Toolkit's store comes with redux-thunk,
 * so work that takes time, such as encoding, is written as thunks.
 */
export const store = configureStore({
  reducer: {
    [Operation.ENCODE]: encodeReducer,
    [Operation.DECODE]: decodeReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

/** A thunk: work that reads the state and dispatches actions, now or later. */
export type AppThunk<Result = void> = ThunkAction<Result, RootState, unknown, UnknownAction>;
