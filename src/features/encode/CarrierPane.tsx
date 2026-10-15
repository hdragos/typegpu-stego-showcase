import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { Button } from '../../components/Button';
import { ButtonVariant } from '../../components/constants';
import { EmptyState } from '../../components/EmptyState';
import { FileButton } from '../../components/FileButton';
import { ImageViewer } from '../../components/ImageViewer';
import { Panel } from '../../components/Panel';
import type { Algorithm } from '../../constants/algorithms';
import { ACCEPT_ANY_IMAGE } from '../../constants/files';
import { FILLED_TRANSPARENCY_NOTE } from '../../constants/messages';
import { Status } from '../../constants/status';
import { formatBytes } from '../../stego/format';
import { loadCarrier } from './encodeThunks';

/** The main pane: the image to encode into, or a way to choose one. */
export function CarrierPane({ algorithm }: { readonly algorithm: Algorithm }) {
  const dispatch = useAppDispatch();
  const carrier = useAppSelector((state) => state.encode.carrier);
  const busy = useAppSelector((state) => state.encode.status !== Status.IDLE);

  const load = (file: File | null) => void dispatch(loadCarrier({ algorithm, file }));
  const choices = (
    <>
      <FileButton
        accept={ACCEPT_ANY_IMAGE}
        onFile={load}
        disabled={busy}
        variant={carrier === null ? ButtonVariant.PRIMARY : ButtonVariant.SECONDARY}
      >
        {carrier === null ? 'Choose an image' : 'Change image'}
      </FileButton>
      <Button variant={ButtonVariant.SECONDARY} disabled={busy} onClick={() => load(null)}>
        Use the sample
      </Button>
    </>
  );

  return (
    <Panel title="Image">
      {carrier === null ? (
        <EmptyState
          title="Choose an image to hide a message in"
          description="A photo works best. It never leaves your device."
          actions={choices}
        />
      ) : (
        <ImageViewer
          key={carrier.id}
          src={carrier.previewUrl}
          alt="The image the message will be hidden in"
          width={carrier.width}
          height={carrier.height}
          actions={choices}
          caption={
            <>
              {carrier.name}, {carrier.width} × {carrier.height} pixels. It can hold{' '}
              {formatBytes(carrier.capacity)}.
              {carrier.filledTransparency && ` ${FILLED_TRANSPARENCY_NOTE}`}
            </>
          }
        />
      )}
    </Panel>
  );
}
