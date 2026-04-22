import type { PersistedGameState } from '../types/game'
import { DAILY_MISSION_TARGET } from '../types/game'
import { badgeCatalog, questNodes } from '../data/questMap'
import { hangulLessons } from '../data/hangulLessons'

/** Local calendar date YYYY-MM-DD */
export function localDateString(d = new Date()): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function yesterdayString(today: string): string {
  const [y, m, d] = today.split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() - 1)
  return localDateString(dt)
}

export function xpToLevel(xp: number): number {
  return 1 + Math.floor(xp / 200)
}

export function xpWithinLevel(xp: number): { current: number; next: number } {
  const level = xpToLevel(xp)
  const floor = (level - 1) * 200
  const next = level * 200
  return { current: xp - floor, next: next - floor }
}

export function updateStreak(
  lastPlay: string | null,
  streak: number,
  today: string
): { streakDays: number; lastPlayLocalDate: string } {
  if (!lastPlay) {
    return { streakDays: 1, lastPlayLocalDate: today }
  }
  if (lastPlay === today) {
    return { streakDays: streak, lastPlayLocalDate: today }
  }
  if (lastPlay === yesterdayString(today)) {
    return { streakDays: streak + 1, lastPlayLocalDate: today }
  }
  return { streakDays: 1, lastPlayLocalDate: today }
}

function lessonIdsForZone(zoneId: string): string[] {
  return hangulLessons.filter((l) => l.zoneId === zoneId).map((l) => l.id)
}

function isLessonComplete(state: PersistedGameState, lessonId: string): boolean {
  return state.completedLessonIds.includes(lessonId)
}

function prerequisitesMet(
  state: PersistedGameState,
  prerequisiteNodeIds: string[]
): boolean {
  return prerequisiteNodeIds.every((nid) => {
    const node = questNodes.find((n) => n.id === nid)
    if (!node) return true
    return isLessonComplete(state, node.lessonId)
  })
}

/** Nodes whose prereqs are satisfied by completed lessons */
export function computeUnlockedNodes(state: PersistedGameState): string[] {
  const unlocked = new Set<string>()
  for (const node of questNodes) {
    if (prerequisitesMet(state, node.prerequisiteNodeIds)) {
      unlocked.add(node.id)
    }
  }
  return [...unlocked]
}

export function mergeUnlocked(
  prevUnlocked: string[],
  computed: string[]
): string[] {
  const s = new Set([...prevUnlocked, ...computed])
  return [...s]
}

export function evaluateNewBadges(
  prev: PersistedGameState,
  next: PersistedGameState
): string[] {
  const already = new Set(prev.earnedBadgeIds)
  const newly: string[] = []

  const complete = (id: string) => next.completedLessonIds.includes(id)

  const hongdaeLessons = lessonIdsForZone('hongdae')
  const allHongdae = hongdaeLessons.every(complete)

  const checks: { id: string; ok: boolean }[] = [
    {
      id: 'badge_first_gate',
      ok: next.completedLessonIds.length >= 1,
    },
    { id: 'badge_hongdae_hero', ok: allHongdae },
    {
      id: 'badge_river_runner',
      ok: complete('lesson-syllables'),
    },
    {
      id: 'badge_summit_scholar',
      ok: complete('lesson-boss'),
    },
    {
      id: 'badge_streak_3',
      ok: next.streakDays >= 3,
    },
    {
      id: 'badge_daily_champion',
      ok: next.lessonsCompletedCountThatDate >= DAILY_MISSION_TARGET,
    },
  ]

  for (const { id, ok } of checks) {
    if (ok && !already.has(id) && badgeCatalog.some((b) => b.id === id)) {
      newly.push(id)
    }
  }
  return newly
}

export function initialPersistedState(): PersistedGameState {
  const unlocked = computeUnlockedNodes({
    version: 1,
    xp: 0,
    completedLessonIds: [],
    unlockedNodeIds: [],
    earnedBadgeIds: [],
    lastPlayLocalDate: null,
    streakDays: 0,
    soundEnabled: true,
    lessonsCompletedOnDate: null,
    lessonsCompletedCountThatDate: 0,
    dailyMissionClaimedForDate: null,
  })
  return {
    version: 1,
    xp: 0,
    completedLessonIds: [],
    unlockedNodeIds: mergeUnlocked([], unlocked),
    earnedBadgeIds: [],
    lastPlayLocalDate: null,
    streakDays: 0,
    soundEnabled: true,
    lessonsCompletedOnDate: null,
    lessonsCompletedCountThatDate: 0,
    dailyMissionClaimedForDate: null,
  }
}
