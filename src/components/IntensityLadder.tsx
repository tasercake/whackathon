import type { Level } from '../types';
import { MAX_LEVEL } from '../types';

/** Bar heights are the literal values from the artboard. */
const HEIGHTS = [24, 32, 41, 49, 57, 64, 71, 78];

export const LEVEL_WORDS: Record<number, string> = {
  1: 'barely a nudge',
  2: 'a tap',
  3: 'a sharp tap',
  4: 'a real jolt',
  5: 'a hard jolt',
  6: 'a bite',
  7: 'a hard bite',
  8: 'do not pick this',
};

interface Props {
  /** The level being displayed as selected. */
  value: Level;
  /** Nothing above this can be selected. For the goal flow this equals `value`
   *  (the user is setting the cap); for grants it's the user's own cap. */
  cap: Level;
  onChange?: (level: Level) => void;
  /** When true the ladder is read-only — used anywhere the cap can't be raised. */
  readOnly?: boolean;
}

export function IntensityLadder({ value, cap, onChange, readOnly }: Props) {
  return (
    <div className="ladder" role="group" aria-label="Intensity ceiling">
      {Array.from({ length: MAX_LEVEL }, (_, i) => {
        const level = (i + 1) as Level;
        const locked = level > cap;
        const selected = level === value;
        const cls = selected
          ? 'ladder__bar ladder__bar--cap'
          : level < value
            ? 'ladder__bar ladder__bar--under'
            : 'ladder__bar';
        return (
          <button
            key={level}
            type="button"
            className={cls}
            style={{ height: HEIGHTS[i] }}
            disabled={readOnly || locked}
            aria-pressed={selected}
            aria-label={`Level ${level} of ${MAX_LEVEL} — ${LEVEL_WORDS[level]}${
              locked ? ' (locked)' : ''
            }`}
            onClick={() => onChange?.(level)}
          />
        );
      })}
    </div>
  );
}
