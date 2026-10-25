import { describe, it, expect } from 'vitest';
import { FILE_FORMAT_VERSION, FILE_MAGIC, SecretKind } from '../constants/secrets';
import {
  bytesToText,
  NotTextError,
  packedFileSize,
  packSecret,
  textToBytes,
  UnreadableFileError,
  unpackSecret,
  type Secret,
} from './secrets';

const name = 'Ελλάδα notes.pdf';
// Starts like the file magic, to show the content can hold anything.
const content = new Uint8Array([0xff, 0x46, 0x49, 0x4c, 0x00, 0x80]);
const file: Secret = { kind: SecretKind.FILE, name, content };

describe('packSecret and unpackSecret', () => {
  it('keep a text message as its UTF-8 bytes', async () => {
    const message: Secret = { kind: SecretKind.TEXT, message: 'Café ☕' };
    const packed = await packSecret(message);
    expect(packed).toEqual(textToBytes('Café ☕'));
    expect(await unpackSecret(packed)).toEqual(message);
  });

  it('round-trip a file, with its name', async () => {
    expect(await unpackSecret(await packSecret(file))).toEqual(file);
  });

  it('take exactly the packed size worked out in advance', async () => {
    expect((await packSecret(file)).length).toBe(packedFileSize(name, content.length));
  });

  it('never read a message as a file, even one that starts with FIL', async () => {
    const packed = await packSecret({ kind: SecretKind.TEXT, message: 'FIL' });
    expect(await unpackSecret(packed)).toEqual({ kind: SecretKind.TEXT, message: 'FIL' });
  });

  it('reject a damaged file', async () => {
    const packed = await packSecret(file);
    const damaged = packed.map((value, index) => (index === packed.length - 1 ? value ^ 1 : value));
    await expect(unpackSecret(damaged)).rejects.toBeInstanceOf(UnreadableFileError);
  });

  it('reject a file in a newer format', async () => {
    const packed = await packSecret(file);
    packed[FILE_MAGIC.length] = FILE_FORMAT_VERSION + 1;
    await expect(unpackSecret(packed)).rejects.toBeInstanceOf(UnreadableFileError);
  });

  it('reject a file cut short', async () => {
    const packed = await packSecret(file);
    await expect(unpackSecret(packed.slice(0, packed.length - 3))).rejects.toBeInstanceOf(
      UnreadableFileError,
    );
    await expect(unpackSecret(packed.slice(0, FILE_MAGIC.length + 2))).rejects.toBeInstanceOf(
      UnreadableFileError,
    );
  });

  it('reject bytes that are neither text nor a file', async () => {
    await expect(unpackSecret(new Uint8Array([0xff, 0xfe, 0xfd]))).rejects.toBeInstanceOf(
      NotTextError,
    );
  });
});

describe('bytesToText', () => {
  it('rejects bytes that are not UTF-8 text', () => {
    expect(() => bytesToText(new Uint8Array([0xff, 0xfe, 0xfd]))).toThrow(NotTextError);
  });
});
