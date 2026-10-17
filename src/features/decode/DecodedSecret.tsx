import { useAppSelector } from '../../app/hooks';
import { ButtonLink } from '../../components/ButtonLink';
import { NoticeKind } from '../../components/constants';
import { DescriptionList } from '../../components/DescriptionList';
import { Notice } from '../../components/Notice';
import { Panel } from '../../components/Panel';
import { TextArea } from '../../components/TextArea';
import { STATUS_MESSAGE } from '../../constants/messages';
import { SecretKind } from '../../constants/secrets';
import { formatBytes } from '../../stego/format';

/** The control pane: the secret found in the image, a message or a file, or why there's none. */
export function DecodedSecret() {
  const { outcome, status } = useAppSelector((state) => state.decode);
  const statusMessage = STATUS_MESSAGE[status];
  const secret = outcome?.found === true ? outcome.secret : null;

  return (
    <Panel title="Secret">
      {secret?.kind === SecretKind.FILE ? (
        <>
          <DescriptionList
            items={[
              { term: 'Hidden file', details: secret.file.name },
              { term: 'Size', details: formatBytes(secret.file.size) },
            ]}
          />
          <ButtonLink href={secret.file.url} download={secret.file.name}>
            Download the file
          </ButtonLink>
        </>
      ) : (
        <TextArea
          label="The hidden message"
          placeholder="The hidden message appears here. A hidden file appears as a download."
          rows={10}
          readOnly
          value={secret?.kind === SecretKind.TEXT ? secret.message : ''}
        />
      )}
      {statusMessage !== null && <Notice kind={NoticeKind.STATUS}>{statusMessage}</Notice>}
      {outcome?.found === false && <Notice kind={NoticeKind.PROBLEM}>{outcome.problem}</Notice>}
    </Panel>
  );
}
