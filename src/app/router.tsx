import { createHashRouter, Navigate } from 'react-router';
import { HOME_PATH, RoutePattern } from '../constants/routes';
import { DecodePage } from '../features/decode/DecodePage';
import { EncodePage } from '../features/encode/EncodePage';
import { Layout } from './Layout';

/**
 * The app's pages. Paths come after a `#`, as in `/#/encode/lsb`, so a static host can
 * serve every page from the one `index.html`: GitHub Pages can't send other paths to it.
 */
export const router = createHashRouter([
  {
    path: RoutePattern.ROOT,
    element: <Layout />,
    children: [
      { index: true, element: <Navigate to={HOME_PATH} replace /> },
      { path: RoutePattern.ENCODE, element: <EncodePage /> },
      { path: RoutePattern.DECODE, element: <DecodePage /> },
      { path: RoutePattern.ANY, element: <Navigate to={HOME_PATH} replace /> },
    ],
  },
]);
