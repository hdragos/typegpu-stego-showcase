import styles from './BitToggles.module.css';

interface BitTogglesProps {
  /** Names the row for screen readers, such as "Red bits". */
  readonly label: string;
  /** How many bits to show, counting from bit 0, the lowest. */
  readonly bitCount: number;
  /** The number whose bits are shown. */
  readonly value: number;
  readonly onChange: (value: number) => void;
}

/**
 * A row of switches, one per bit of a number, the highest bit first, as the number is
 * written in binary. Each switch shows its bit, 0 or 1, under the bit's index.
 */
export function BitToggles({ label, bitCount, value, onChange }: BitTogglesProps) {
  const bits = Array.from({ length: bitCount }, (_, position) => bitCount - 1 - position);
  return (
    <div role="group" aria-label={label} className={styles.row}>
      {bits.map((bit) => {
        const on = ((value >> bit) & 1) === 1;
        return (
          <div key={bit} className={styles.bit}>
            <span className={styles.index} aria-hidden="true">
              {bit}
            </span>
            <button
              type="button"
              className={styles.toggle}
              aria-pressed={on}
              aria-label={`Bit ${bit}`}
              onClick={() => onChange(value ^ (1 << bit))}
            >
              {on ? 1 : 0}
            </button>
          </div>
        );
      })}
    </div>
  );
}
