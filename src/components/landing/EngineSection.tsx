/**
 * Landing section 6 — the engine: three colored stack layer cards on the
 * left, a pure-SVG architecture flow diagram plus the data sources dialog on
 * the right.
 */

import { Atom, Box, Database } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/landing/Reveal'
import { DataSourcesDialog } from '@/components/shared/DataSourcesDialog'
import { COLORS, MODE_COLORS } from '@/config/theme'
import {
  ENGINE_CAPTION,
  ENGINE_FLOW_NODES,
  ENGINE_INTRO,
  ENGINE_LAYERS,
  ENGINE_VIEW_SOURCES_LABEL,
} from '@/config/landingContent'
import type { EngineLayerId } from '@/config/landingContent'

const LAYER_ICONS: Record<EngineLayerId, LucideIcon> = {
  react: Atom,
  webgl: Box,
  apis: Database,
}

const LAYER_CARD_CLASSES: Record<EngineLayerId, string> = {
  react: 'bg-brand-blue text-white',
  webgl: 'bg-warm-peach text-[#0B0F17]',
  apis: 'bg-white text-[#0B0F17]',
}

const LAYER_ICON_CLASSES: Record<EngineLayerId, string> = {
  react: 'bg-white/15',
  webgl: 'bg-[#0B0F17]/10',
  apis: 'bg-[#0B0F17]/8',
}

const LAYER_DESCRIPTION_CLASSES: Record<EngineLayerId, string> = {
  react: 'text-white/85',
  webgl: 'text-[#0B0F17]/80',
  apis: 'text-[#0B0F17]/75',
}

// Flow diagram geometry (viewBox 360 x 312).
const NODE_WIDTH = 320
const NODE_HEIGHT = 56
const NODE_X = 20
const NODE_GAP = 80
const NODE_START_Y = 8
const NODE_CENTER_X = NODE_X + NODE_WIDTH / 2

export function EngineSection() {
  return (
    <section id="engine" aria-labelledby="engine-heading" className="scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <Reveal className="max-w-3xl">
          <p className="eyebrow">{ENGINE_INTRO.eyebrow}</p>
          <h2
            id="engine-heading"
            className="mt-3 font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl"
          >
            {ENGINE_INTRO.heading}
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-6 lg:grid-cols-2 lg:gap-10">
          <div className="flex flex-col gap-4">
            {ENGINE_LAYERS.map((layer, index) => {
              const Icon = LAYER_ICONS[layer.id]
              return (
                <Reveal key={layer.id} delay={index * 0.08}>
                  <article className={`flex items-start gap-4 rounded-xl p-6 ${LAYER_CARD_CLASSES[layer.id]}`}>
                    <span
                      aria-hidden="true"
                      className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${LAYER_ICON_CLASSES[layer.id]}`}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="font-heading text-base font-bold">{layer.name}</h3>
                      <p className={`mt-1.5 text-sm leading-relaxed ${LAYER_DESCRIPTION_CLASSES[layer.id]}`}>
                        {layer.description}
                      </p>
                    </div>
                  </article>
                </Reveal>
              )
            })}
          </div>

          <Reveal delay={0.1} className="flex flex-col gap-5">
            <div className="rounded-xl border border-white/8 bg-surface-raised/40 p-4 sm:p-6">
              <svg
                viewBox="0 0 360 312"
                role="img"
                aria-label="Architecture flow diagram: interface, 3D engine, services and API routes, health data providers"
                className="mx-auto h-auto w-full max-w-sm"
              >
                {ENGINE_FLOW_NODES.map((label, index) => {
                  const nodeY = NODE_START_Y + index * NODE_GAP
                  const isEngine = index === 1
                  return (
                    <g key={label}>
                      <rect
                        x={NODE_X}
                        y={nodeY}
                        width={NODE_WIDTH}
                        height={NODE_HEIGHT}
                        rx="12"
                        fill={COLORS.surfaceRaised}
                        stroke={isEngine ? MODE_COLORS.build : 'rgba(255,255,255,0.10)'}
                        strokeWidth={isEngine ? 1.5 : 1}
                      />
                      <text
                        x={NODE_CENTER_X}
                        y={nodeY + NODE_HEIGHT / 2}
                        textAnchor="middle"
                        dominantBaseline="central"
                        fontSize="13"
                        fontWeight="600"
                        fill={COLORS.text}
                      >
                        {label}
                      </text>
                      {index < ENGINE_FLOW_NODES.length - 1 ? (
                        <g aria-hidden="true">
                          <line
                            x1={NODE_CENTER_X}
                            y1={nodeY + NODE_HEIGHT + 4}
                            x2={NODE_CENTER_X}
                            y2={nodeY + NODE_GAP - 10}
                            stroke={COLORS.copper}
                            strokeWidth="2"
                          />
                          <polygon
                            points={`${NODE_CENTER_X},${nodeY + NODE_GAP - 1} ${NODE_CENTER_X - 5.5},${nodeY + NODE_GAP - 10} ${NODE_CENTER_X + 5.5},${nodeY + NODE_GAP - 10}`}
                            fill={COLORS.copper}
                          />
                        </g>
                      ) : null}
                    </g>
                  )
                })}
              </svg>
            </div>

            <div className="flex flex-col items-start gap-3">
              <DataSourcesDialog>
                <Button
                  variant="outline"
                  className="h-11 border-white/15 bg-transparent px-5 text-sm font-semibold hover:bg-white/5"
                >
                  <Database className="h-4 w-4" aria-hidden="true" />
                  {ENGINE_VIEW_SOURCES_LABEL}
                </Button>
              </DataSourcesDialog>
              <p className="text-xs leading-relaxed text-muted-foreground">{ENGINE_CAPTION}</p>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  )
}
