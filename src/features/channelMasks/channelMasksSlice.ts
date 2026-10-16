import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import {
  CHANNEL_MASKS_SLICE,
  DEFAULT_CHANNEL_MASKS,
  type ChannelMasks,
} from '../../constants/channelMasks';

/**
 * The channel masks LSB encodes and decodes with. Both pages share them, so an image
 * encoded here decodes with the masks it was encoded with.
 */
const channelMasksSlice = createSlice({
  name: CHANNEL_MASKS_SLICE,
  initialState: DEFAULT_CHANNEL_MASKS,
  reducers: {
    channelMasksChanged: (_state, action: PayloadAction<ChannelMasks>) => action.payload,
  },
});

export const { channelMasksChanged } = channelMasksSlice.actions;
export const channelMasksReducer = channelMasksSlice.reducer;
