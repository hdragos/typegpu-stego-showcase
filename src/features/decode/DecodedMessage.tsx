import { useAppSelector } from '../../app/hooks';
import { NoticeKind } from '../../components/constants';
import { Notice } from '../../components/Notice';
import { Panel } from '../../components/Panel';
import { TextArea } from '../../components/TextArea';
import { STATUS_MESSAGE } from '../../constants/messages';

/** The control pane: the message found in the image, or why there's none. */
export function DecodedMessage() {
  const { outcome, status } = useAppSelector((state) => state.decode);
  const statusMessage = STATUS_MESSAGE[status];

  return (
    <Panel title="Message">
      <TextArea
        label="The hidden message"
        placeholder="The hidden message appears here."
        rows={10}
        readOnly
        value={outcome !== null && outcome.found ? outcome.message : ''}
      />
      {statusMessage !== null && <Notice kind={NoticeKind.STATUS}>{statusMessage}</Notice>}
      {outcome !== null && !outcome.found && (
        <Notice kind={NoticeKind.PROBLEM}>{outcome.problem}</Notice>
      )}
    </Panel>
  );
}
