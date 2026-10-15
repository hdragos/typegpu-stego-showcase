import { Navigate } from 'react-router';
import { useAppSelector } from '../../app/hooks';
import { PageHeader } from '../../components/PageHeader';
import { TwoPaneLayout } from '../../components/TwoPaneLayout';
import { ALGORITHM_INFO, type Algorithm } from '../../constants/algorithms';
import { Operation, OPERATION_LABEL } from '../../constants/operations';
import { HOME_PATH } from '../../constants/routes';
import { useAlgorithmParam } from '../useAlgorithmParam';
import { CarrierPane } from './CarrierPane';
import { EncodeControls } from './EncodeControls';
import { EncodedResult } from './EncodedResult';

/** The encode page: the image on the left, the message on the right, the result below. */
export function EncodePage() {
  const algorithm = useAlgorithmParam();
  if (algorithm === null) {
    return <Navigate to={HOME_PATH} replace />;
  }
  return <EncodeWorkspace algorithm={algorithm} />;
}

function EncodeWorkspace({ algorithm }: { readonly algorithm: Algorithm }) {
  const result = useAppSelector((state) => state.encode.result);
  const info = ALGORITHM_INFO[algorithm];
  return (
    <>
      <PageHeader
        title={`${OPERATION_LABEL[Operation.ENCODE]} with ${info.name}`}
        description={`Hide a secret message in an image. ${info.summary}`}
      />
      <TwoPaneLayout
        main={<CarrierPane algorithm={algorithm} />}
        side={<EncodeControls algorithm={algorithm} />}
        below={result !== null && <EncodedResult algorithm={algorithm} result={result} />}
      />
    </>
  );
}
