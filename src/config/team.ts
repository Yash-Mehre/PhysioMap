/**
 * Team roster for the landing page. Initials power the avatar badges,
 * `isLeader` marks the single team leader. No roles beyond that by design.
 */

export interface TeamMember {
  /** Stable key for React lists. */
  id: string
  initials: string
  name: string
  isLeader?: boolean
}

export const TEAM_MEMBERS: readonly TeamMember[] = [
  { id: 'yashpreet', initials: 'YS', name: 'Yashpreet Singh', isLeader: true },
  { id: 'yuvraj', initials: 'YS', name: 'Yuvraj Singh' },
  { id: 'manik', initials: 'MB', name: 'Manik Bhalla' },
  { id: 'vinayak', initials: 'V', name: 'Vinayak' },
  { id: 'udhayveer', initials: 'US', name: 'Udhayveer Singh' },
]
