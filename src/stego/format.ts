import { ENCODED_NAME_SUFFIX, FILE_EXTENSION, PNG_EXTENSION } from '../constants/files';
import { ByteUnit } from '../constants/messages';

/** A byte count in words, such as "1 byte" or "1,024 bytes". */
export function formatBytes(count: number): string {
  return `${count.toLocaleString()} ${count === 1 ? ByteUnit.ONE : ByteUnit.MANY}`;
}

/** The name of an image once a message is encoded in it: `holiday.jpg` becomes `holiday-encoded.png`. */
export function encodedFileName(name: string): string {
  return `${name.replace(FILE_EXTENSION, '')}${ENCODED_NAME_SUFFIX}${PNG_EXTENSION}`;
}
