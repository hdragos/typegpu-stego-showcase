import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from './Button';
import { classNames } from './classNames';
import { ACTUAL_SIZE, ButtonVariant } from './constants';
import { fitScale, formatScale, zoomInFrom, zoomOutFrom } from './zoom';
import styles from './ImageViewer.module.css';

interface ImageViewerProps {
  readonly src: string;
  readonly alt: string;
  /** The image's size in pixels, to zoom from. */
  readonly width: number;
  readonly height: number;
  /** More controls for the viewer's bar, such as choosing another image. */
  readonly actions?: ReactNode;
  /** A line under the image. */
  readonly caption?: ReactNode;
}

/**
 * An image that starts out fitted to its frame, and zooms in and out from there. Above
 * actual size, pixels are drawn as sharp squares, so changes to single pixels stay
 * visible. Give each image its own `key`, so the zoom starts over for a new one.
 */
export function ImageViewer({ src, alt, width, height, actions, caption }: ImageViewerProps) {
  // Null while the image is fitted to the frame; otherwise, the scale it's drawn at.
  const [scale, setScale] = useState<number | null>(null);
  // The scale that fits the image to the frame, kept up to date as the frame resizes.
  const [fittedScale, setFittedScale] = useState(ACTUAL_SIZE);
  const frame = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const box = frame.current;
    if (box === null) {
      return;
    }
    const observer = new ResizeObserver(() => {
      setFittedScale(fitScale(width, height, box.clientWidth, box.clientHeight));
    });
    observer.observe(box);
    return () => observer.disconnect();
  }, [width, height]);

  /** The scale the image is drawn at right now, fitted or not. */
  const shownScale = scale ?? fittedScale;

  return (
    <figure className={styles.viewer}>
      <div className={styles.bar}>
        <div className={styles.zoom} role="group" aria-label="Zoom">
          <Button
            variant={ButtonVariant.GHOST}
            aria-label="Zoom out"
            onClick={() => setScale(zoomOutFrom(shownScale))}
          >
            −
          </Button>
          <span className={styles.scale}>{formatScale(shownScale)}</span>
          <Button
            variant={ButtonVariant.GHOST}
            aria-label="Zoom in"
            onClick={() => setScale(zoomInFrom(shownScale))}
          >
            +
          </Button>
          <Button
            variant={ButtonVariant.GHOST}
            disabled={scale === null}
            onClick={() => setScale(null)}
          >
            Fit
          </Button>
          <Button
            variant={ButtonVariant.GHOST}
            disabled={scale === ACTUAL_SIZE}
            onClick={() => setScale(ACTUAL_SIZE)}
          >
            Actual size
          </Button>
        </div>
        {actions !== undefined && <div className={styles.actions}>{actions}</div>}
      </div>
      <div ref={frame} className={styles.frame} style={{ aspectRatio: `${width} / ${height}` }}>
        <img
          src={src}
          alt={alt}
          className={classNames(
            styles.image,
            scale === null && styles.fitted,
            scale !== null && scale > ACTUAL_SIZE && styles.pixelated,
          )}
          style={scale === null ? undefined : { width: width * scale, height: height * scale }}
        />
      </div>
      {caption !== undefined && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
