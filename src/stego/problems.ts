import { CapacityExceededError, MalformedStegoError } from 'typegpu-stego';
import { Problem } from '../constants/messages';
import { UnreadableImageError } from './images';
import { NotTextError, UnreadableFileError } from './secrets';

/** Say in plain words what went wrong. Errors nobody planned for are logged, too. */
export function describeProblem(caught: unknown): string {
  if (
    caught instanceof UnreadableImageError ||
    caught instanceof NotTextError ||
    caught instanceof UnreadableFileError
  ) {
    return caught.message;
  }
  if (caught instanceof CapacityExceededError) {
    return Problem.TOO_BIG;
  }
  if (caught instanceof MalformedStegoError) {
    return Problem.NO_MESSAGE;
  }
  console.error(caught);
  const detail = caught instanceof Error ? caught.message : String(caught);
  return `${Problem.UNEXPECTED} ${detail}`;
}
