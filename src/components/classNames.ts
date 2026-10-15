/** Join the class names that apply, skipping the ones switched off. */
export function classNames(...names: readonly (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(' ');
}
