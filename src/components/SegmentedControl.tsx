import { useId } from 'react';
import styles from './SegmentedControl.module.css';

export interface Segment<Value extends string> {
  readonly value: Value;
  readonly label: string;
}

interface SegmentedControlProps<Value extends string> {
  /** Names the choice for screen readers, such as "What to hide". */
  readonly label: string;
  readonly segments: readonly Segment<Value>[];
  readonly value: Value;
  readonly onChange: (value: Value) => void;
}

/**
 * A choice of one of a few options, shown as joined buttons in a row. Underneath, it's a
 * group of radio buttons, so the arrow keys move between the options.
 */
export function SegmentedControl<Value extends string>({
  label,
  segments,
  value,
  onChange,
}: SegmentedControlProps<Value>) {
  const name = useId();
  return (
    <fieldset className={styles.control}>
      <legend className={styles.legend}>{label}</legend>
      {segments.map((segment) => (
        <label key={segment.value} className={styles.segment}>
          <input
            type="radio"
            className={styles.radio}
            name={name}
            value={segment.value}
            checked={segment.value === value}
            onChange={() => onChange(segment.value)}
          />
          <span className={styles.text}>{segment.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
