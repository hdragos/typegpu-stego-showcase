import { describe, it, expect } from 'vitest';
import { fitScale, formatScale, zoomInFrom, zoomOutFrom } from './zoom';

describe('zoomInFrom and zoomOutFrom', () => {
  it('step to the next zoom level', () => {
    expect(zoomInFrom(1)).toBe(1.5);
    expect(zoomOutFrom(1)).toBe(0.75);
  });

  it('step from a fitted scale that falls between two levels', () => {
    expect(zoomInFrom(0.3)).toBe(0.5);
    expect(zoomOutFrom(0.3)).toBe(0.25);
  });

  it('stop at the largest and smallest levels', () => {
    expect(zoomInFrom(16)).toBe(16);
    expect(zoomOutFrom(0.1)).toBe(0.1);
  });
});

describe('fitScale', () => {
  it('shrinks an image to fit its frame', () => {
    expect(fitScale(2000, 1000, 1000, 1000)).toBe(0.5);
  });

  it('never blows a small image up', () => {
    expect(fitScale(100, 100, 1000, 1000)).toBe(1);
  });
});

describe('formatScale', () => {
  it('shows a scale as a whole percentage', () => {
    expect(formatScale(1.5)).toBe('150%');
    expect(formatScale(0.333)).toBe('33%');
  });
});
