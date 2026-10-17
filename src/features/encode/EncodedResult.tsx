import { useNavigate } from 'react-router';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { Button } from '../../components/Button';
import { ButtonLink } from '../../components/ButtonLink';
import { ButtonVariant } from '../../components/constants';
import { ImageViewer } from '../../components/ImageViewer';
import { Panel } from '../../components/Panel';
import type { Algorithm } from '../../constants/algorithms';
import { Operation } from '../../constants/operations';
import { pathFor } from '../../constants/routes';
import type { ImageInfo } from '../../stego/imageStore';
import { decodeEncodedResult } from '../decode/decodeThunks';

interface EncodedResultProps {
  readonly algorithm: Algorithm;
  readonly result: ImageInfo;
}

/**
 * Below the panes: the encoded image, to download, or to decode straight away. Its onion
 * skin lays it over the original, to compare them.
 */
export function EncodedResult({ algorithm, result }: EncodedResultProps) {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const carrier = useAppSelector((state) => state.encode.carrier);

  function decodeIt() {
    dispatch(decodeEncodedResult(algorithm));
    void navigate(pathFor(Operation.DECODE, algorithm));
  }

  return (
    <Panel
      title="Encoded image"
      actions={
        <>
          <ButtonLink href={result.previewUrl} download={result.name}>
            Download
          </ButtonLink>
          <Button variant={ButtonVariant.SECONDARY} onClick={decodeIt}>
            Decode it
          </Button>
        </>
      }
    >
      <ImageViewer
        key={result.id}
        src={result.previewUrl}
        alt="The image with the message hidden in it"
        width={result.width}
        height={result.height}
        onionSkin={
          carrier === null
            ? undefined
            : {
                beforeSrc: carrier.previewUrl,
                beforeAlt: 'The original image',
                beforeLabel: 'Original',
                afterLabel: 'Encoded',
              }
        }
        caption="It now holds your secret. Keep it as a PNG, and share it as a file: apps that compress images, such as most chat apps, destroy the secret."
      />
    </Panel>
  );
}
