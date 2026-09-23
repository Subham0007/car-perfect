export type ScoreTier = 'green' | 'amber' | 'red'

export function getScoreTier(score: number): ScoreTier {
  if (score >= 75) return 'green'
  if (score >= 50) return 'amber'
  return 'red'
}
