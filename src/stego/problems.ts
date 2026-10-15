import { CapacityExceededError, MalformedStegoError } from 'typegpu-stego';
import { Problem } from '../constants/messages';
import { NotTextError } from './codec';
import { UnreadableImageError } from './images';

/** Say in plain words what went wrong. Errors nobody planned for are logged, too. */
export function describeProblem(caught: unknown): string {
  if (caught instanceof UnreadableImageError || caught instanceof NotTextError) {
    return caught.message;
  }
  if (caught instanceof CapacityExceededError) {
    return Problem.MESSAGE_TOO_LONG;
  }
  if (caught instanceof MalformedStegoError) {
    return Problem.NO_MESSAGE;
  }
  console.error(caught);
  const detail = caught instanceof Error ? caught.message : String(caught);
  return `${Problem.UNEXPECTED} ${detail}`;
}
