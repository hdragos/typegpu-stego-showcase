import { BitToggles } from '../../components/BitToggles';
import { NumberField } from '../../components/NumberField';
import {
  BITS_PER_MASK,
  CHANNEL_LABEL,
  MAX_MASK,
  MIN_MASK,
  type Channel,
} from '../../constants/channelMasks';
import { parseMask } from '../../stego/channelMasks';

interface ChannelMaskFieldProps {
  readonly channel: Channel;
  /** What's typed in the box, which may not be a mask yet. */
  readonly text: string;
  readonly onChange: (text: string) => void;
}

/**
 * One channel's mask: a box for the number, with a switch for each of its bits under it.
 * Typing a number sets the switches, and flipping a switch changes the number.
 */
export function ChannelMaskField({ channel, text, onChange }: ChannelMaskFieldProps) {
  const mask = parseMask(text);
  const label = CHANNEL_LABEL[channel];
  return (
    <NumberField
      label={label}
      hint={`${MIN_MASK} to ${MAX_MASK}`}
      invalid={mask === null}
      min={MIN_MASK}
      max={MAX_MASK}
      value={text}
      onChange={(event) => onChange(event.target.value)}
    >
      <BitToggles
        label={`${label} bits`}
        bitCount={BITS_PER_MASK}
        value={mask ?? MIN_MASK}
        onChange={(next) => onChange(String(next))}
      />
    </NumberField>
  );
}
