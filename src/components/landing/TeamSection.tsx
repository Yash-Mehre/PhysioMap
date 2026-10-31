/**
 * Landing section 9 — the team: five initial-badge cards, one leader marker,
 * no invented titles.
 */

import { Reveal } from '@/components/landing/Reveal'
import { TEAM_MEMBERS } from '@/config/team'
import { TEAM_CAPTION, TEAM_INTRO, TEAM_LEADER_LABEL } from '@/config/landingContent'

export function TeamSection() {
  return (
    <section id="team" aria-labelledby="team-heading" className="scroll-mt-20 py-16 sm:py-24">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6">
        <Reveal className="max-w-3xl">
          <p className="eyebrow">{TEAM_INTRO.eyebrow}</p>
          <h2
            id="team-heading"
            className="mt-3 font-heading text-2xl font-extrabold tracking-tight text-foreground sm:text-4xl"
          >
            {TEAM_INTRO.heading}
          </h2>
        </Reveal>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
          {TEAM_MEMBERS.map((member, index) => (
            <Reveal key={member.id} delay={index * 0.06} className="h-full">
              <article className="flex h-full flex-col items-center gap-3 rounded-xl border border-white/8 bg-surface-raised/60 p-6 text-center">
                <span
                  aria-hidden="true"
                  className="flex h-12 w-12 items-center justify-center rounded-full border border-copper/40 bg-copper/10 font-heading text-sm font-bold text-copper"
                >
                  {member.initials}
                </span>
                <p className="text-sm font-semibold text-foreground">{member.name}</p>
                <span className="flex h-5 items-center">
                  {member.isLeader ? (
                    <span className="rounded-full border border-copper/30 bg-copper/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-copper">
                      {TEAM_LEADER_LABEL}
                    </span>
                  ) : null}
                </span>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.15}>
          <p className="mt-8 text-center text-sm text-muted-foreground">{TEAM_CAPTION}</p>
        </Reveal>
      </div>
    </section>
  )
}
