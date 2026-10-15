import { useParams } from 'react-router';
import { ALGORITHMS, type Algorithm } from '../constants/algorithms';
import { ALGORITHM_PARAM } from '../constants/routes';

/** The algorithm the current route names, or null if it names none the app offers. */
export function useAlgorithmParam(): Algorithm | null {
  const value = useParams()[ALGORITHM_PARAM];
  return ALGORITHMS.find((algorithm) => algorithm === value) ?? null;
}
