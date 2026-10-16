import { useId, useState, type FormEvent } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { Button } from '../../components/Button';
import { ButtonVariant, NoticeKind } from '../../components/constants';
import { FieldRow } from '../../components/FieldRow';
import { Modal } from '../../components/Modal';
import { Notice } from '../../components/Notice';
import type { Algorithm } from '../../constants/algorithms';
import { CHANNELS, DEFAULT_CHANNEL_MASKS } from '../../constants/channelMasks';
import { Status } from '../../constants/status';
import { bitsPerPixel, masksToTexts, readMaskDraft } from '../../stego/channelMasks';
import { ChannelMaskField } from './ChannelMaskField';
import { changeChannelMasks } from './channelMasksThunks';

/** A button that opens a dialog to change the channel masks. */
export function ChannelMasksPicker({ algorithm }: { readonly algorithm: Algorithm }) {
  const dispatch = useAppDispatch();
  const channelMasks = useAppSelector((state) => state.channelMasks);
  // New masks change what both pages show, so they wait until neither is busy.
  const busy = useAppSelector(
    (state) => state.encode.status !== Status.IDLE || state.decode.status !== Status.IDLE,
  );
  const [open, setOpen] = useState(false);
  const [texts, setTexts] = useState(() => masksToTexts(channelMasks));
  const formId = useId();
  const draft = readMaskDraft(texts);

  function start() {
    setTexts(masksToTexts(channelMasks));
    setOpen(true);
  }

  function apply(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (draft.valid && !busy) {
      setOpen(false);
      dispatch(changeChannelMasks(algorithm, draft.masks));
    }
  }

  return (
    <>
      <Button variant={ButtonVariant.SECONDARY} onClick={start}>
        Change
      </Button>
      <Modal
        title="Channel masks"
        description="Pick which bits of each colour hold the message, from bit 0, the lowest, to bit 7. More bits hold more, but change the image more. An image decodes only with the masks it was encoded with."
        open={open}
        onClose={() => setOpen(false)}
        actions={
          <>
            <Button
              variant={ButtonVariant.GHOST}
              onClick={() => setTexts(masksToTexts(DEFAULT_CHANNEL_MASKS))}
            >
              Use the default
            </Button>
            <Button variant={ButtonVariant.SECONDARY} onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form={formId} disabled={!draft.valid || busy}>
              Apply
            </Button>
          </>
        }
      >
        <form id={formId} onSubmit={apply}>
          <FieldRow>
            {CHANNELS.map((channel) => (
              <ChannelMaskField
                key={channel}
                channel={channel}
                text={texts[channel]}
                onChange={(text) => setTexts((previous) => ({ ...previous, [channel]: text }))}
              />
            ))}
          </FieldRow>
        </form>
        {draft.valid ? (
          <Notice kind={NoticeKind.STATUS}>Bits per pixel: {bitsPerPixel(draft.masks)}</Notice>
        ) : (
          <Notice kind={NoticeKind.PROBLEM}>{draft.problem}</Notice>
        )}
      </Modal>
    </>
  );
}
