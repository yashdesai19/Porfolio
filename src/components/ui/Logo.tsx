// "YD" monogram built only from vertical bars (the same language as the hero lines and
// the reference's bar mark). 15 columns in a 40×32 box: Y uses columns 0–6, D uses 8–14.
// Each bar is [column, top, bottom]; letters are drawn on the column grid, so every edge is clean.
const COLS = 15
const STEP = 40 / COLS
const BAR_W = STEP * 0.84

const LOGO_BARS: [number, number, number][] = [
  // Y: two arms, a notch, and a three-bar stem
  [0, 0, 12], [1, 0, 12],
  [2, 7, 32], [3, 11, 32], [4, 7, 32],
  [5, 0, 12], [6, 0, 12],
  // D: a two-bar stem, top and bottom rails, and a rounded bowl
  [8, 0, 32], [9, 0, 32],
  [10, 0, 4.5], [11, 0, 4.5], [12, 0, 4.5],
  [10, 27.5, 32], [11, 27.5, 32], [12, 27.5, 32],
  [13, 1.5, 30.5],
  [14, 5, 27],
]

type Props = { className?: string; title?: string }

export function Logo({ className, title }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 40 32"
      fill="var(--c-logo)"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      {LOGO_BARS.map(([c, top, bottom]) => (
        <rect key={`${c}-${top}`} className="logo-bar" x={(c * STEP).toFixed(3)} y={top} width={BAR_W.toFixed(3)} height={bottom - top} />
      ))}
    </svg>
  )
}
