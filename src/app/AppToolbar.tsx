import { Link, useMatch, useNavigate } from 'react-router';
import { DropdownMenu, type DropdownItem } from '../components/DropdownMenu';
import { Toolbar } from '../components/Toolbar';
import { ALGORITHM_INFO, ALGORITHMS } from '../constants/algorithms';
import { LIBRARY_URL } from '../constants/links';
import { OPERATION_LABEL, OPERATIONS, type Operation } from '../constants/operations';
import { ALGORITHM_PARAM, HOME_PATH, OPERATION_ROUTE, pathFor } from '../constants/routes';
import styles from './AppToolbar.module.css';

/** The toolbar on every page: the app's name, and a menu per operation to pick an algorithm. */
export function AppToolbar() {
  return (
    <Toolbar
      label="Operations"
      brand={
        <Link to={HOME_PATH} className={styles.brand}>
          Hidden in plain sight
          <span className={styles.subtitle}>typegpu-stego showcase</span>
        </Link>
      }
      end={
        <a className={styles.link} href={LIBRARY_URL}>
          typegpu-stego on GitHub
        </a>
      }
    >
      {OPERATIONS.map((operation) => (
        <OperationMenu key={operation} operation={operation} />
      ))}
    </Toolbar>
  );
}

/** One operation's menu: the algorithms it can run with. */
function OperationMenu({ operation }: { readonly operation: Operation }) {
  const navigate = useNavigate();
  const match = useMatch(OPERATION_ROUTE[operation]);
  const currentAlgorithm = match?.params[ALGORITHM_PARAM];
  const items: DropdownItem[] = ALGORITHMS.map((algorithm) => ({
    id: algorithm,
    label: ALGORITHM_INFO[algorithm].name,
    description: ALGORITHM_INFO[algorithm].summary,
    current: algorithm === currentAlgorithm,
    onSelect: () => void navigate(pathFor(operation, algorithm)),
  }));
  return <DropdownMenu label={OPERATION_LABEL[operation]} items={items} active={match !== null} />;
}
