'use client'

/**
 * Pure SVG semicircle BMI gauge. Four colored band segments (underweight /
 * normal / overweight / obese) across a 14–40 BMI domain, with a needle at
 * the user's value and the value centered below in the heading font.
 * Server-renderable: no effects, no measurements.
 */

import type { BmiCategoryKey } from '@/types/nutrition'

/** Gauge domain — anything outside is clamped onto the arc. */
const DOMAIN_MIN = 14
const DOMAIN_MAX = 40

/** Semicircle geometry (viewBox 0 0 200 124). */
const CENTER_X = 100
const CENTER_Y = 100
const ARC_RADIUS = 80
const BAND_STROKE = 13
const NEEDLE_RADIUS = 63
const SEPARATOR_INNER = 72
const SEPARATOR_OUTER = 88

/** Band + needle colors per category (matches the palette in globals.css). */
const CATEGORY_COLORS: Record<BmiCategoryKey, string> = {
  underweight: '#F3B38A',
  normal: '#58B584',
  overweight: '#E8A94A',
  obese: '#F26B4E',
}

/** Human-readable category names for the accessible label. */
const CATEGORY_LABELS: Record<BmiCategoryKey, string> = {
  underweight: 'Underweight',
  normal: 'Normal weight',
  overweight: 'Overweight',
  obese: 'Obese',
}

/** Fixed WHO-style band boundaries drawn on the gauge arc. */
const GAUGE_BANDS: readonly { key: BmiCategoryKey; from: number; to: number }[] = [
  { key: 'underweight', from: DOMAIN_MIN, to: 18.5 },
  { key: 'normal', from: 18.5, to: 25 },
  { key: 'overweight', from: 25, to: 30 },
  { key: 'obese', from: 30, to: DOMAIN_MAX },
]

/** Band boundaries, drawn as thin separators in the page background color. */
const BOUNDARIES: readonly number[] = [18.5, 25, 30]

/**
 * Point on the gauge for a BMI value at the given radius. The value maps to
 * an angle from 0 (left end, BMI 14) sweeping over the top to π (right end,
 * BMI 40); screen coordinates are y-down, hence y = cy − r·sin(θ).
 */
function pointAt(value: number, radius: number): { x: number; y: number } {
  const safe = Number.isFinite(value) ? value : DOMAIN_MIN
  const clamped = Math.min(Math.max(safe, DOMAIN_MIN), DOMAIN_MAX)
  const theta = (Math.PI * (clamped - DOMAIN_MIN)) / (DOMAIN_MAX - DOMAIN_MIN)
  return {
    x: CENTER_X - radius * Math.cos(theta),
    y: CENTER_Y - radius * Math.sin(theta),
  }
}

/**
 * SVG arc path (A command) between two BMI values at the given radius,
 * sweeping clockwise over the top of the semicircle.
 */
function describeArc(from: number, to: number, radius: number): string {
  const start = pointAt(from, radius)
  const end = pointAt(to, radius)
  const spanDegrees = ((to - from) / (DOMAIN_MAX - DOMAIN_MIN)) * 180
  const largeArc = spanDegrees > 180 ? 1 : 0
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 ${largeArc} 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`
}

export interface BmiGaugeProps {
  /** BMI value to point the needle at (clamped to 14–40). */
  value: number
  /** Category the value falls into — drives needle + number color. */
  categoryKey: BmiCategoryKey
}

export function BmiGauge({ value, categoryKey }: BmiGaugeProps) {
  const color = CATEGORY_COLORS[categoryKey]
  const needleTip = pointAt(value, NEEDLE_RADIUS)
  const arcPoint = pointAt(value, ARC_RADIUS)
  const valueLabel = Number.isFinite(value) ? value.toFixed(1) : '—'

  return (
    <svg
      viewBox="0 0 200 124"
      className="h-36 w-full"
      role="img"
      aria-label={`BMI gauge showing ${valueLabel}, ${CATEGORY_LABELS[categoryKey]} category`}
    >
      {/* Colored band segments */}
      {GAUGE_BANDS.map((band, index) => (
        <path
          key={band.key}
          d={describeArc(band.from, band.to, ARC_RADIUS)}
          fill="none"
          stroke={CATEGORY_COLORS[band.key]}
          strokeOpacity={0.9}
          strokeWidth={BAND_STROKE}
          strokeLinecap={
            index === 0 || index === GAUGE_BANDS.length - 1 ? 'round' : 'butt'
          }
        />
      ))}

      {/* Thin separators between the band segments */}
      {BOUNDARIES.map((boundary) => {
        const inner = pointAt(boundary, SEPARATOR_INNER)
        const outer = pointAt(boundary, SEPARATOR_OUTER)
        return (
          <line
            key={boundary}
            x1={inner.x}
            y1={inner.y}
            x2={outer.x}
            y2={outer.y}
            stroke="#0B0F17"
            strokeWidth={2.5}
            strokeLinecap="round"
          />
        )
      })}

      {/* Needle + hub at the user's value */}
      <line
        x1={CENTER_X}
        y1={CENTER_Y}
        x2={needleTip.x}
        y2={needleTip.y}
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <circle cx={CENTER_X} cy={CENTER_Y} r={4.5} fill={color} />
      <circle cx={arcPoint.x} cy={arcPoint.y} r={3.5} fill="#0B0F17" stroke={color} strokeWidth={2} />

      {/* Domain end labels */}
      <text x={20} y={115} fontSize={9} className="fill-current text-muted-foreground" textAnchor="start">
        {DOMAIN_MIN}
      </text>
      <text x={180} y={115} fontSize={9} className="fill-current text-muted-foreground" textAnchor="end">
        {DOMAIN_MAX}
      </text>

      {/* Value, centered below the hub */}
      <text
        x={CENTER_X}
        y={120}
        textAnchor="middle"
        fontSize={22}
        fontWeight={700}
        className="fill-current font-heading"
        style={{ color }}
      >
        {valueLabel}
      </text>
    </svg>
  )
}
