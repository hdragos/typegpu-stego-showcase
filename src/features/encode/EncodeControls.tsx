import { useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { Button } from '../../components/Button';
import { NoticeKind } from '../../components/constants';
import { FileField } from '../../components/FileField';
import { Notice } from '../../components/Notice';
import { Panel } from '../../components/Panel';
import { SegmentedControl } from '../../components/SegmentedControl';
import { TextArea } from '../../components/TextArea';
import type { Algorithm } from '../../constants/algorithms';
import { STATUS_MESSAGE } from '../../constants/messages';
import { SECRET_KIND_LABEL, SECRET_KINDS, SecretKind } from '../../constants/secrets';
import { Status } from '../../constants/status';
import { formatBytes } from '../../stego/format';
import type { SecretFileInfo } from '../../stego/secretFiles';
import { packedFileSize, textToBytes } from '../../stego/secrets';
import { changeMessage, changeSecretKind, chooseFile } from './encodeSlice';
import { encodeSecret } from './encodeThunks';

const SECRET_KIND_SEGMENTS = SECRET_KINDS.map((kind) => ({
  value: kind,
  label: SECRET_KIND_LABEL[kind],
}));

/** The control pane: the secret to hide, a message or a file, and the button that encodes it. */
export function EncodeControls({ algorithm }: { readonly algorithm: Algorithm }) {
  const dispatch = useAppDispatch();
  const { carrier, secretKind, message, file, status, problem } = useAppSelector(
    (state) => state.encode,
  );
  const messageBytes = useMemo(() => textToBytes(message).length, [message]);
  const hidingText = secretKind === SecretKind.TEXT;
  const secretBytes = hidingText ? messageBytes : packedSize(file);
  const capacity = carrier?.capacity ?? 0;
  const tooBig = secretBytes > capacity;
  const nothingToHide = hidingText ? messageBytes === 0 : file === null;
  const hint = `${formatBytes(secretBytes)} of ${formatBytes(capacity)}`;
  const statusMessage = STATUS_MESSAGE[status];

  return (
    <Panel title="Secret">
      <SegmentedControl
        label="What to hide"
        segments={SECRET_KIND_SEGMENTS}
        value={secretKind}
        onChange={(kind) => dispatch(changeSecretKind(kind))}
      />
      {hidingText ? (
        <TextArea
          label="The message to hide"
          placeholder={carrier === null ? 'Choose an image first' : 'Write a secret message'}
          rows={10}
          value={message}
          disabled={carrier === null}
          invalid={tooBig}
          hint={hint}
          onChange={(event) => dispatch(changeMessage(event.target.value))}
        />
      ) : (
        <FileField
          label="The file to hide"
          fileName={file?.name ?? null}
          disabled={carrier === null}
          invalid={tooBig}
          hint={hint}
          onFile={(chosen) => dispatch(chooseFile(chosen))}
        />
      )}
      <Button
        disabled={carrier === null || nothingToHide || tooBig || status !== Status.IDLE}
        onClick={() => void dispatch(encodeSecret(algorithm))}
      >
        Encode
      </Button>
      {statusMessage !== null && <Notice kind={NoticeKind.STATUS}>{statusMessage}</Notice>}
      {problem !== null && <Notice kind={NoticeKind.PROBLEM}>{problem}</Notice>}
    </Panel>
  );
}

/** How many bytes the file takes once packed, or none before a file is chosen. */
function packedSize(file: SecretFileInfo | null): number {
  return file === null ? 0 : packedFileSize(file.name, file.size);
}
