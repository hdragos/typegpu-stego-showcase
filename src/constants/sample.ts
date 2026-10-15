// The sample image: a dusk landscape, drawn in the browser so the demo works without a
// photo of your own. Positions and sizes are fractions of the image.

export const SAMPLE_FILE_NAME = 'sample-dusk.png';

export const SAMPLE_WIDTH = 1280;
export const SAMPLE_HEIGHT = 800;

/** The sky, top to bottom: each colour, and where it sits from 0 (top) to 1 (bottom). */
export const SKY_STOPS = [
  { offset: 0, colour: '#1d2b64' },
  { offset: 0.55, colour: '#c86b98' },
  { offset: 0.8, colour: '#f8b37b' },
] as const;

/** The sun's glow: where its centre is, how far it reaches, and the share that's solid. */
export const SUN = {
  X: 0.68,
  Y: 0.66,
  RADIUS: 0.4,
  CORE: 0.12,
  COLOUR: '#fff3c4',
  FADED: 'rgba(255, 243, 196, 0)',
} as const;

/** The stars, placed by a seeded generator, so every sample is the same. */
export const STARS = {
  COUNT: 160,
  /** How far down the sky they reach, from the top. */
  DEPTH: 0.45,
  SEED: 20_261_011,
  MIN_RADIUS: 0.5,
  RADIUS_RANGE: 1.3,
  MIN_OPACITY: 0.35,
  COLOUR: '#ffffff',
} as const;

/**
 * The rolling hills, farthest first. Each has a baseline and a height, from the top, the
 * number of waves across the image, and a phase that shifts the waves along.
 */
export const HILLS = [
  { colour: '#7a4b7e', baseline: 0.72, amplitude: 0.05, waves: 1.4, phase: 0 },
  { colour: '#4b3166', baseline: 0.81, amplitude: 0.04, waves: 2.2, phase: 1.7 },
  { colour: '#241a3d', baseline: 0.9, amplitude: 0.03, waves: 3, phase: 3.4 },
] as const;

/** The distance, in pixels, between points along a hill's outline. */
export const HILL_STEP = 8;

/** The Park–Miller random number generator: small, and exact in JavaScript numbers. */
export const PARK_MILLER = { MULTIPLIER: 16_807, MODULUS: 2_147_483_647 } as const;
