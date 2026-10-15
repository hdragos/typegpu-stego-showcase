// The sample image, so the demo works without a photo of your own. Its scene is described
// in constants/sample.ts.

import { PNG_TYPE } from '../constants/files';
import {
  HILL_STEP,
  HILLS,
  PARK_MILLER,
  SAMPLE_FILE_NAME,
  SAMPLE_HEIGHT,
  SAMPLE_WIDTH,
  SKY_STOPS,
  STARS,
  SUN,
} from '../constants/sample';
import { context2d } from './images';

/**
 * Draw the sample, a dusk landscape. It's returned as a PNG file, so it goes through the
 * same steps as an image you choose.
 */
export async function drawSample(): Promise<File> {
  const canvas = new OffscreenCanvas(SAMPLE_WIDTH, SAMPLE_HEIGHT);
  const context = context2d(canvas);

  const sky = context.createLinearGradient(0, 0, 0, SAMPLE_HEIGHT);
  for (const stop of SKY_STOPS) {
    sky.addColorStop(stop.offset, stop.colour);
  }
  context.fillStyle = sky;
  context.fillRect(0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT);

  drawStars(context);
  drawSun(context);
  for (const hill of HILLS) {
    drawHill(context, hill);
  }

  const png = await canvas.convertToBlob({ type: PNG_TYPE });
  return new File([png], SAMPLE_FILE_NAME, { type: PNG_TYPE });
}

/** Stars in the upper sky, from a seeded generator, so every sample is the same. */
function drawStars(context: OffscreenCanvasRenderingContext2D) {
  let seed: number = STARS.SEED;
  const random = () => {
    seed = (seed * PARK_MILLER.MULTIPLIER) % PARK_MILLER.MODULUS;
    return seed / PARK_MILLER.MODULUS;
  };
  context.fillStyle = STARS.COLOUR;
  for (let star = 0; star < STARS.COUNT; star++) {
    const x = random() * SAMPLE_WIDTH;
    const y = random() * SAMPLE_HEIGHT * STARS.DEPTH;
    const radius = STARS.MIN_RADIUS + random() * STARS.RADIUS_RANGE;
    context.globalAlpha = STARS.MIN_OPACITY + random() * (1 - STARS.MIN_OPACITY);
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.fill();
  }
  context.globalAlpha = 1;
}

/** The sun's glow: solid at the centre, fading out to the edge. */
function drawSun(context: OffscreenCanvasRenderingContext2D) {
  const x = SAMPLE_WIDTH * SUN.X;
  const y = SAMPLE_HEIGHT * SUN.Y;
  const glow = context.createRadialGradient(x, y, 0, x, y, SAMPLE_HEIGHT * SUN.RADIUS);
  glow.addColorStop(0, SUN.COLOUR);
  glow.addColorStop(SUN.CORE, SUN.COLOUR);
  glow.addColorStop(1, SUN.FADED);
  context.fillStyle = glow;
  context.fillRect(0, 0, SAMPLE_WIDTH, SAMPLE_HEIGHT);
}

/** One row of rolling hills, filled down to the bottom of the image. */
function drawHill(context: OffscreenCanvasRenderingContext2D, hill: (typeof HILLS)[number]) {
  const baseline = SAMPLE_HEIGHT * hill.baseline;
  const amplitude = SAMPLE_HEIGHT * hill.amplitude;
  context.beginPath();
  context.moveTo(0, SAMPLE_HEIGHT);
  for (let x = 0; x <= SAMPLE_WIDTH; x += HILL_STEP) {
    const angle = (x / SAMPLE_WIDTH) * hill.waves * 2 * Math.PI + hill.phase;
    context.lineTo(x, baseline - amplitude * Math.sin(angle));
  }
  context.lineTo(SAMPLE_WIDTH, SAMPLE_HEIGHT);
  context.closePath();
  context.fillStyle = hill.colour;
  context.fill();
}
