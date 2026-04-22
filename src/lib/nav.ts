import { questNodes } from '../data/questMap'
import type { PersistedGameState } from '../types/game'

export function nextLessonLink(state: PersistedGameState): string | null {
  const unlocked = new Set(state.unlockedNodeIds)
  const completed = new Set(state.completedLessonIds)

  for (const node of questNodes) {
    if (!unlocked.has(node.id)) continue
    if (!completed.has(node.lessonId)) return `/lesson/${node.lessonId}`
  }

  const last = questNodes[questNodes.length - 1]
  return last ? `/lesson/${last.lessonId}` : '/map'
}
