import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { ButtonVariant } from '../../components/constants';
import { EmptyState } from '../../components/EmptyState';
import { FileButton } from '../../components/FileButton';
import { ImageViewer } from '../../components/ImageViewer';
import { Panel } from '../../components/Panel';
import type { Algorithm } from '../../constants/algorithms';
import { ACCEPT_PNG } from '../../constants/files';
import { Status } from '../../constants/status';
import { decodeImage } from './decodeThunks';

/** The main pane: the image to decode, or a way to choose one. */
export function EncodedImagePane({ algorithm }: { readonly algorithm: Algorithm }) {
  const dispatch = useAppDispatch();
  const image = useAppSelector((state) => state.decode.image);
  const busy = useAppSelector((state) => state.decode.status !== Status.IDLE);

  const decode = (file: File) => void dispatch(decodeImage({ algorithm, file, name: file.name }));
  const choice = (
    <FileButton
      accept={ACCEPT_PNG}
      onFile={decode}
      disabled={busy}
      variant={image === null ? ButtonVariant.PRIMARY : ButtonVariant.SECONDARY}
    >
      {image === null ? 'Choose a PNG' : 'Change image'}
    </FileButton>
  );

  return (
    <Panel title="Image">
      {image === null ? (
        <EmptyState
          title="Choose an image with a message in it"
          description="A PNG encoded here or by typegpu-stego. Set the channel masks it was encoded with."
          actions={choice}
        />
      ) : (
        <ImageViewer
          key={image.id}
          src={image.previewUrl}
          alt="The image being decoded"
          width={image.width}
          height={image.height}
          actions={choice}
          caption={image.name}
        />
      )}
    </Panel>
  );
}
