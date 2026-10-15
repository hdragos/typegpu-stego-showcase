import { describe, it, expect } from 'vitest';
import { encodedFileName, formatBytes } from './format';

describe('formatBytes', () => {
  it('uses the singular for one byte only', () => {
    expect(formatBytes(1)).toBe('1 byte');
    expect(formatBytes(0)).toBe('0 bytes');
    expect(formatBytes(42)).toBe('42 bytes');
  });
});

describe('encodedFileName', () => {
  it('swaps the extension for -encoded.png', () => {
    expect(encodedFileName('holiday.jpg')).toBe('holiday-encoded.png');
    expect(encodedFileName('archive.tar.gz')).toBe('archive.tar-encoded.png');
  });

  it('works for a name without an extension', () => {
    expect(encodedFileName('notes')).toBe('notes-encoded.png');
  });
});
