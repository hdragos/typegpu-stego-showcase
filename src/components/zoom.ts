// The image viewer's zoom arithmetic, kept apart from the component so it can be tested.

import { ACTUAL_SIZE, SCALE_TOLERANCE, ZOOM_STEPS } from './constants';

const SMALLEST = Math.min(...ZOOM_STEPS);
const LARGEST = Math.max(...ZOOM_STEPS);

/** The next zoom step above `scale`, or the largest step if there's none. */
export function zoomInFrom(scale: number): number {
  const larger = ZOOM_STEPS.filter((step) => step > scale + SCALE_TOLERANCE);
  return larger.length > 0 ? Math.min(...larger) : LARGEST;
}

/** The next zoom step below `scale`, or the smallest step if there's none. */
export function zoomOutFrom(scale: number): number {
  const smaller = ZOOM_STEPS.filter((step) => step < scale - SCALE_TOLERANCE);
  return smaller.length > 0 ? Math.max(...smaller) : SMALLEST;
}

/**
 * The scale at which a `width` × `height` image fits inside a `boxWidth` × `boxHeight`
 * frame. It's never above actual size: small images aren't blown up to fill the frame.
 */
export function fitScale(
  width: number,
  height: number,
  boxWidth: number,
  boxHeight: number,
): number {
  return Math.min(boxWidth / width, boxHeight / height, ACTUAL_SIZE);
}

/** A scale as a percentage, such as 150%. */
export function formatScale(scale: number): string {
  return `${Math.round(scale * 100)}%`;
}
