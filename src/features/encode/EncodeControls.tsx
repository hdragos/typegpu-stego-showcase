import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { Button } from '../../components/Button';
import { NoticeKind } from '../../components/constants';
import { Notice } from '../../components/Notice';
import { Panel } from '../../components/Panel';
import { TextArea } from '../../components/TextArea';
import type { Algorithm } from '../../constants/algorithms';
import { STATUS_MESSAGE } from '../../constants/messages';
import { Status } from '../../constants/status';
import { textToBytes } from '../../stego/codec';
import { formatBytes } from '../../stego/format';
import { changeMessage } from './encodeSlice';
import { encodeMessage } from './encodeThunks';

/** The control pane: the message to hide, and the button that encodes it. */
export function EncodeControls({ algorithm }: { readonly algorithm: Algorithm }) {
  const dispatch = useAppDispatch();
  const { carrier, message, status, problem } = useAppSelector((state) => state.encode);
  const messageBytes = useMemo(() => textToBytes(message).length, [message]);
  const capacity = carrier?.capacity ?? 0;
  const tooLong = messageBytes > capacity;
  const statusMessage = STATUS_MESSAGE[status];

  return (
    <Panel title="Message">
      <TextArea
        label="The message to hide"
        placeholder={carrier === null ? 'Choose an image first' : 'Write a secret message'}
        rows={10}
        value={message}
        disabled={carrier === null}
        invalid={tooLong}
        hint={`${formatBytes(messageBytes)} of ${formatBytes(capacity)}`}
        onChange={(event) => dispatch(changeMessage(event.target.value))}
      />
      <Button
        disabled={carrier === null || messageBytes === 0 || tooLong || status !== Status.IDLE}
        onClick={() => void dispatch(encodeMessage(algorithm))}
      >
        Encode
      </Button>
      {statusMessage !== null && <Notice kind={NoticeKind.STATUS}>{statusMessage}</Notice>}
      {problem !== null && <Notice kind={NoticeKind.PROBLEM}>{problem}</Notice>}
    </Panel>
  );
}
