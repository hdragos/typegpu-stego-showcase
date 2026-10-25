// The files on screen: a file chosen to hide, and a file found in an image. Redux keeps
// only plain data about each, so the file itself is kept here, looked up by id.

import { Bug } from '../constants/messages';

/** What Redux keeps about a file: plain data only. */
export interface SecretFileInfo {
  /** The id to look the file up by. */
  readonly id: string;
  readonly name: string;
  /** Its size, in bytes. */
  readonly size: number;
  /** An object URL to download it from. */
  readonly url: string;
}

interface KeptFile {
  readonly file: Blob;
  readonly url: string;
}

const files = new Map<string, KeptFile>();

/** Keep `file`, and return what Redux keeps about it. */
export function rememberSecretFile(file: Blob, name: string): SecretFileInfo {
  const id = crypto.randomUUID();
  const url = URL.createObjectURL(file);
  files.set(id, { file, url });
  return { id, name, size: file.size, url };
}

/** The file kept for `id`. */
export function recallSecretFile(id: string): Blob {
  const kept = files.get(id);
  if (kept === undefined) {
    throw new Error(Bug.NO_SECRET_FILE_KEPT);
  }
  return kept.file;
}

/** Let go of a file and its URL. Does nothing when there's no file. */
export function forgetSecretFile(id: string | undefined): void {
  if (id === undefined) {
    return;
  }
  const kept = files.get(id);
  if (kept !== undefined) {
    URL.revokeObjectURL(kept.url);
    files.delete(id);
  }
}
