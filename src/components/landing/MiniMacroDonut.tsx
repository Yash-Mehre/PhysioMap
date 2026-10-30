/**
 * Pure-SVG sample macro donut (no chart library). Sample split: protein 30%,
 * carbs 50%, fat 20% around a 2,625 kcal center label. The parent card adds
 * the "Sample" chip — this component is only the donut itself.
 */

const RADIUS = 40
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

interface MacroSegment {
  id: string
  color: string
  /** Percentage of the ring (0–100). */
  value: number
}

const SEGMENTS: readonly MacroSegment[] = [
  { id: 'protein', color: '#F26B4E', value: 30 },
  { id: 'carbs', color: '#3B74F2', value: 50 },
  { id: 'fat', color: '#F3B38A', value: 20 },
]

interface MacroArc extends MacroSegment {
  /** Stroke length for this segment. */
  length: number
  /** Negative cumulative offset so segments run clockwise from 12 o'clock. */
  offset: number
}

const ARCS: readonly MacroArc[] = (() => {
  let accumulated = 0
  return SEGMENTS.map((segment) => {
    const length = (segment.value / 100) * CIRCUMFERENCE
    const arc: MacroArc = { ...segment, length, offset: -accumulated }
    accumulated += length
    return arc
  })
})()

export function MiniMacroDonut() {
  return (
    <figure className="relative h-24 w-24 shrink-0" role="img" aria-label="Sample macro split donut chart">
      <svg viewBox="0 0 96 96" className="h-24 w-24" aria-hidden="true">
        <g transform="rotate(-90 48 48)">
          <circle cx="48" cy="48" r={RADIUS} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="10" />
          {ARCS.map((arc) => (
            <circle
              key={arc.id}
              cx="48"
              cy="48"
              r={RADIUS}
              fill="none"
              stroke={arc.color}
              strokeWidth="10"
              strokeDasharray={`${arc.length} ${CIRCUMFERENCE - arc.length}`}
              strokeDashoffset={arc.offset}
            />
          ))}
        </g>
      </svg>
      <figcaption className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-semibold leading-tight text-foreground">2,625 kcal</span>
      </figcaption>
      <span className="sr-only">
        Sample split: protein 30 percent, carbs 50 percent, fat 20 percent, about 2,625 kilocalories per day.
      </span>
    </figure>
  )
}
