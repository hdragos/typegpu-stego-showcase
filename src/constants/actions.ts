import { Operation } from './operations';

/**
 * The Redux action types of the app's async work, one per thunk. Each slice is named after
 * its operation, so a thunk's type starts with the slice it belongs to.
 */
export const ThunkType = {
  LOAD_CARRIER: `${Operation.ENCODE}/loadCarrier`,
  MEASURE_CARRIER: `${Operation.ENCODE}/measureCarrier`,
  ENCODE_MESSAGE: `${Operation.ENCODE}/encodeMessage`,
  DECODE_IMAGE: `${Operation.DECODE}/decodeImage`,
  REDECODE_IMAGE: `${Operation.DECODE}/redecodeImage`,
} as const;
