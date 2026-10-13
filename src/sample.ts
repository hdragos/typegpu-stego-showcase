// A sample image drawn in the browser, so the demo works without a photo of your own.

import { context2d, PNG_TYPE } from './image';

/** The sample's file name, as the Hide tab shows it. */
const SAMPLE_NAME = 'sample-dusk.png';

const WIDTH = 1280;
const HEIGHT = 800;

/** Dusk colours, from the top of the sky down to the nearest hills. */
const Palette = {
  SKY_TOP: '#1d2b64',
  SKY_MIDDLE: '#c86b98',
  HORIZON: '#f8b37b',
  STAR: '#ffffff',
  SUN: '#fff3c4',
  SUN_FADED: 'rgba(255, 243, 196, 0)',
  HILLS: ['#7a4b7e', '#4b3166', '#241a3d'],
} as const;

const STAR_COUNT = 160;

/**
 * Draw the sample, a dusk landscape. It's returned as a PNG file, so it goes through the
 * same steps as an image you choose.
 */
export async function drawSample(): Promise<File> {
  const canvas = new OffscreenCanvas(WIDTH, HEIGHT);
  const context = context2d(canvas);

  const sky = context.createLinearGradient(0, 0, 0, HEIGHT);
  sky.addColorStop(0, Palette.SKY_TOP);
  sky.addColorStop(0.55, Palette.SKY_MIDDLE);
  sky.addColorStop(0.8, Palette.HORIZON);
  context.fillStyle = sky;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  drawStars(context);

  const sunX = WIDTH * 0.68;
  const sunY = HEIGHT * 0.66;
  const glow = context.createRadialGradient(sunX, sunY, 0, sunX, sunY, HEIGHT * 0.4);
  glow.addColorStop(0, Palette.SUN);
  glow.addColorStop(0.12, Palette.SUN);
  glow.addColorStop(1, Palette.SUN_FADED);
  context.fillStyle = glow;
  context.fillRect(0, 0, WIDTH, HEIGHT);

  Palette.HILLS.forEach((colour, layer) => drawHills(context, colour, layer));

  const png = await canvas.convertToBlob({ type: PNG_TYPE });
  return new File([png], SAMPLE_NAME, { type: PNG_TYPE });
}

/** One row of rolling hills. Each layer is nearer, lower and darker than the last. */
function drawHills(context: OffscreenCanvasRenderingContext2D, colour: string, layer: number) {
  const baseline = HEIGHT * (0.72 + layer * 0.09);
  const amplitude = HEIGHT * (0.05 - layer * 0.01);
  const wavelength = WIDTH / (1.4 + layer * 0.8);
  context.beginPath();
  context.moveTo(0, HEIGHT);
  for (let x = 0; x <= WIDTH; x += 8) {
    context.lineTo(
      x,
      baseline - amplitude * Math.sin((x / wavelength) * 2 * Math.PI + layer * 1.7),
    );
  }
  context.lineTo(WIDTH, HEIGHT);
  context.closePath();
  context.fillStyle = colour;
  context.fill();
}

/** Stars in the upper sky, from a seeded generator, so every sample is the same. */
function drawStars(context: OffscreenCanvasRenderingContext2D) {
  // The Park–Miller generator: small, and exact in JavaScript numbers.
  let seed = 20_261_011;
  const random = () => {
    seed = (seed * 16_807) % 2_147_483_647;
    return seed / 2_147_483_647;
  };
  context.fillStyle = Palette.STAR;
  for (let star = 0; star < STAR_COUNT; star++) {
    const x = random() * WIDTH;
    const y = random() * HEIGHT * 0.45;
    const radius = 0.5 + random() * 1.3;
    context.globalAlpha = 0.35 + random() * 0.65;
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.fill();
  }
  context.globalAlpha = 1;
}
