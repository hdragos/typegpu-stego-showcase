import { Algorithm } from './algorithms';
import { Operation } from './operations';

/** The route parameter that names the algorithm, as in /encode/:algorithm. */
export const ALGORITHM_PARAM = 'algorithm';

/** The router's path patterns. */
export const RoutePattern = {
  ROOT: '/',
  ENCODE: `/${Operation.ENCODE}/:${ALGORITHM_PARAM}`,
  DECODE: `/${Operation.DECODE}/:${ALGORITHM_PARAM}`,
  /** Any path no other pattern matches. */
  ANY: '*',
} as const;

/** Each operation's path pattern. */
export const OPERATION_ROUTE: Readonly<Record<Operation, string>> = {
  [Operation.ENCODE]: RoutePattern.ENCODE,
  [Operation.DECODE]: RoutePattern.DECODE,
};

/** The path of an operation's page for an algorithm, such as /encode/lsb. */
export function pathFor(operation: Operation, algorithm: Algorithm): string {
  return `/${operation}/${algorithm}`;
}

/** Where the app starts: encoding, with the first algorithm. */
export const HOME_PATH = pathFor(Operation.ENCODE, Algorithm.LSB);
