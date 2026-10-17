import { Navigate } from 'react-router';
import { PageHeader } from '../../components/PageHeader';
import { TwoPaneLayout } from '../../components/TwoPaneLayout';
import { ALGORITHM_INFO, type Algorithm } from '../../constants/algorithms';
import { Operation, OPERATION_LABEL } from '../../constants/operations';
import { HOME_PATH } from '../../constants/routes';
import { ChannelMasksPanel } from '../channelMasks/ChannelMasksPanel';
import { useAlgorithmParam } from '../useAlgorithmParam';
import { DecodedSecret } from './DecodedSecret';
import { EncodedImagePane } from './EncodedImagePane';

/**
 * The decode page: the image on the left, and on the right, the secret found in it and
 * the channel masks it was decoded with.
 */
export function DecodePage() {
  const algorithm = useAlgorithmParam();
  if (algorithm === null) {
    return <Navigate to={HOME_PATH} replace />;
  }
  return <DecodeWorkspace algorithm={algorithm} />;
}

function DecodeWorkspace({ algorithm }: { readonly algorithm: Algorithm }) {
  const info = ALGORITHM_INFO[algorithm];
  return (
    <>
      <PageHeader
        title={`${OPERATION_LABEL[Operation.DECODE]} with ${info.name}`}
        description={`Read the message or file hidden in an image. ${info.summary}`}
      />
      <TwoPaneLayout
        main={<EncodedImagePane algorithm={algorithm} />}
        side={
          <>
            <DecodedSecret />
            <ChannelMasksPanel algorithm={algorithm} />
          </>
        }
      />
    </>
  );
}
