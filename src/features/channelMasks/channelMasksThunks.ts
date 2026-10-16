import type { AppThunk } from '../../app/store';
import type { Algorithm } from '../../constants/algorithms';
import type { ChannelMasks } from '../../constants/channelMasks';
import { sameMasks } from '../../stego/channelMasks';
import { forgetImage } from '../../stego/imageStore';
import { redecodeImage } from '../decode/decodeThunks';
import { measureCarrier } from '../encode/encodeThunks';
import { channelMasksChanged } from './channelMasksSlice';

/**
 * Use new channel masks on both pages. The encode page works out again how much its image
 * can hold, and lets go of the image encoded with the old masks. The decode page decodes
 * its image again.
 */
export function changeChannelMasks(algorithm: Algorithm, channelMasks: ChannelMasks): AppThunk {
  return (dispatch, getState) => {
    const { encode, decode, channelMasks: current } = getState();
    if (sameMasks(current, channelMasks)) {
      return;
    }
    forgetImage(encode.result?.id);
    dispatch(channelMasksChanged(channelMasks));
    if (encode.carrier !== null) {
      void dispatch(measureCarrier({ algorithm, carrierId: encode.carrier.id }));
    }
    if (decode.image !== null) {
      void dispatch(redecodeImage({ algorithm, image: decode.image }));
    }
  };
}
