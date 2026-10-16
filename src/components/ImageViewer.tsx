import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Button } from './Button';
import { classNames } from './classNames';
import {
  ACTUAL_SIZE,
  ButtonVariant,
  MAX_OPACITY,
  MIN_OPACITY,
  ONION_SKIN_START,
  OPACITY_STEP,
} from './constants';
import { fitScale, formatPercent, zoomInFrom, zoomOutFrom } from './zoom';
import styles from './ImageViewer.module.css';

/** An earlier version of the image, to lay under it in an onion skin and compare them. */
export interface OnionSkin {
  /** The earlier image. It must be the same size as the one shown. */
  readonly beforeSrc: string;
  readonly beforeAlt: string;
  /** What the slider calls each image, such as "Original" and "Encoded". */
  readonly beforeLabel: string;
  readonly afterLabel: string;
}

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
  /**
   * An earlier version of the image. The bar then gets an Onion skin switch, which lays
   * the image over the earlier one, with a slider for how much of it shows through.
   */
  readonly onionSkin?: OnionSkin;
}

/**
 * An image that starts out fitted to its frame, and zooms in and out from there. Above
 * actual size, pixels are drawn as sharp squares, so changes to single pixels stay
 * visible. Give each image its own `key`, so the zoom starts over for a new one.
 */
export function ImageViewer({
  src,
  alt,
  width,
  height,
  actions,
  caption,
  onionSkin,
}: ImageViewerProps) {
  // Null while the image is fitted to the frame; otherwise, the scale it's drawn at.
  const [scale, setScale] = useState<number | null>(null);
  // The scale that fits the image to the frame, kept up to date as the frame resizes.
  const [fittedScale, setFittedScale] = useState(ACTUAL_SIZE);
  const [onionSkinOn, setOnionSkinOn] = useState(false);
  // How much of the image shows over the earlier one while the onion skin is on.
  const [opacity, setOpacity] = useState(ONION_SKIN_START);
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
  // Both images of an onion skin are drawn alike, so they line up pixel for pixel.
  const imageClassName = classNames(
    styles.image,
    scale === null && styles.fitted,
    scale !== null && scale > ACTUAL_SIZE && styles.pixelated,
  );
  const imageSize = scale === null ? undefined : { width: width * scale, height: height * scale };
  const shownOnionSkin = onionSkinOn ? onionSkin : undefined;

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
          <span className={styles.scale}>{formatPercent(shownScale)}</span>
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
        {(onionSkin !== undefined || actions !== undefined) && (
          <div className={styles.actions}>
            {onionSkin !== undefined && (
              <Button
                variant={ButtonVariant.SECONDARY}
                aria-pressed={onionSkinOn}
                onClick={() => setOnionSkinOn((wasOn) => !wasOn)}
              >
                Onion skin
              </Button>
            )}
            {actions}
          </div>
        )}
      </div>
      {shownOnionSkin !== undefined && (
        <div className={styles.onionSkin}>
          <span aria-hidden="true">{shownOnionSkin.beforeLabel}</span>
          <input
            type="range"
            className={styles.slider}
            min={MIN_OPACITY}
            max={MAX_OPACITY}
            step={OPACITY_STEP}
            value={opacity}
            aria-label={`${shownOnionSkin.afterLabel} opacity`}
            aria-valuetext={formatPercent(opacity)}
            onChange={(event) => setOpacity(Number(event.target.value))}
          />
          <span aria-hidden="true">{shownOnionSkin.afterLabel}</span>
        </div>
      )}
      <div ref={frame} className={styles.frame} style={{ aspectRatio: `${width} / ${height}` }}>
        {shownOnionSkin !== undefined && (
          <img
            src={shownOnionSkin.beforeSrc}
            alt={shownOnionSkin.beforeAlt}
            className={imageClassName}
            style={imageSize}
          />
        )}
        <img
          src={src}
          alt={alt}
          className={imageClassName}
          style={shownOnionSkin === undefined ? imageSize : { ...imageSize, opacity }}
        />
      </div>
      {caption !== undefined && <figcaption className={styles.caption}>{caption}</figcaption>}
    </figure>
  );
}
