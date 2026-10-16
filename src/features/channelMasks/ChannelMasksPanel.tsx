import { useAppSelector } from '../../app/hooks';
import { DescriptionList } from '../../components/DescriptionList';
import { Panel } from '../../components/Panel';
import type { Algorithm } from '../../constants/algorithms';
import { CHANNEL_LABEL, CHANNELS } from '../../constants/channelMasks';
import { bitsPerPixel, formatMask } from '../../stego/channelMasks';
import { ChannelMasksPicker } from './ChannelMasksPicker';

/** The channel masks both pages use, with a button to change them. */
export function ChannelMasksPanel({ algorithm }: { readonly algorithm: Algorithm }) {
  const channelMasks = useAppSelector((state) => state.channelMasks);
  return (
    <Panel title="Channel masks" actions={<ChannelMasksPicker algorithm={algorithm} />}>
      <DescriptionList
        items={[
          ...CHANNELS.map((channel) => ({
            term: CHANNEL_LABEL[channel],
            details: (
              <>
                {channelMasks[channel]} (<code>{formatMask(channelMasks[channel])}</code>)
              </>
            ),
          })),
          { term: 'Bits per pixel', details: bitsPerPixel(channelMasks) },
        ]}
      />
    </Panel>
  );
}
