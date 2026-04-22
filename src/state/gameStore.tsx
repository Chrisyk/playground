import { useCallback, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import type { PersistedGameState } from '../types/game'
import { DAILY_MISSION_TARGET, STORAGE_KEY } from '../types/game'
import type { ToastItem, ToastPayload } from '../types/toast'
import { lessonById } from '../data/hangulLessons'
import { badgeCatalog } from '../data/questMap'
import {
  computeUnlockedNodes,
  evaluateNewBadges,
  initialPersistedState,
  localDateString,
  mergeUnlocked,
  updateStreak,
  xpToLevel,
} from '../lib/progression'
import { GameContext, type GameContextValue } from './gameContext'

type Action =
  | { type: 'hydrate'; payload: PersistedGameState }
  | { type: 'persist'; payload: PersistedGameState }
  | { type: 'toast'; payload: ToastPayload[] }
  | { type: 'dismiss_toast'; id: string }

interface CombinedState {
  game: PersistedGameState
  toasts: ToastItem[]
}

function loadState(): PersistedGameState {
  const base = initialPersistedState()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return base
    const parsed = JSON.parse(raw) as Partial<PersistedGameState>
    if (parsed.version !== 1) return base
    const merged: PersistedGameState = {
      ...base,
      ...parsed,
      version: 1,
      completedLessonIds: parsed.completedLessonIds ?? base.completedLessonIds,
      unlockedNodeIds: parsed.unlockedNodeIds ?? base.unlockedNodeIds,
      earnedBadgeIds: parsed.earnedBadgeIds ?? base.earnedBadgeIds,
    }
    merged.unlockedNodeIds = mergeUnlocked(
      merged.unlockedNodeIds,
      computeUnlockedNodes(merged)
    )
    return merged
  } catch {
    return base
  }
}

function saveState(s: PersistedGameState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s))
  } catch {
    /* ignore */
  }
}

function reducer(state: CombinedState, action: Action): CombinedState {
  switch (action.type) {
    case 'hydrate':
      return { ...state, game: action.payload }
    case 'persist':
      saveState(action.payload)
      return { ...state, game: action.payload }
    case 'toast': {
      const withIds = action.payload.map((t) => ({
        ...t,
        id:
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`,
      }))
      return { ...state, toasts: [...state.toasts, ...withIds] }
    }
    case 'dismiss_toast': {
      const toasts = state.toasts.filter((t) => t.id !== action.id)
      return { ...state, toasts }
    }
    default:
      return state
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const [combined, dispatch] = useReducer(reducer, undefined, () => ({
    game: loadState(),
    toasts: [] as ToastItem[],
  }))

  useEffect(() => {
    dispatch({ type: 'hydrate', payload: loadState() })
  }, [])

  const dismissToast = useCallback((id: string) => {
    dispatch({ type: 'dismiss_toast', id })
  }, [])

  const completeLesson = useCallback(
    (lessonId: string, bonusXp = 0): ToastPayload[] => {
      const lesson = lessonById(lessonId)
      if (!lesson) return []

      const toasts: ToastPayload[] = []
      let next: PersistedGameState = { ...combined.game }
      const today = localDateString()

      if (!next.completedLessonIds.includes(lessonId)) {
        const streakPatch = updateStreak(
          next.lastPlayLocalDate,
          next.streakDays,
          today
        )
        next = {
          ...next,
          ...streakPatch,
          completedLessonIds: [...next.completedLessonIds, lessonId],
        }

        let lessonsToday = next.lessonsCompletedCountThatDate
        if (next.lessonsCompletedOnDate !== today) {
          lessonsToday = 0
        }
        lessonsToday += 1
        next.lessonsCompletedOnDate = today
        next.lessonsCompletedCountThatDate = lessonsToday

        const xpGain = lesson.xpReward + bonusXp
        const oldLevel = xpToLevel(next.xp)
        next.xp += xpGain
        const newLevel = xpToLevel(next.xp)
        toasts.push({
          kind: 'xp',
          amount: xpGain,
          message: `Quest cleared: ${lesson.title}`,
        })
        if (newLevel > oldLevel) {
          toasts.push({ kind: 'level', level: newLevel })
        }

        const unlocked = mergeUnlocked(
          next.unlockedNodeIds,
          computeUnlockedNodes(next)
        )
        next.unlockedNodeIds = unlocked

        const newBadges = evaluateNewBadges(combined.game, next)
        if (newBadges.length) {
          next.earnedBadgeIds = [...new Set([...next.earnedBadgeIds, ...newBadges])]
          for (const bid of newBadges) {
            const def = badgeCatalog.find((b) => b.id === bid)
            toasts.push({
              kind: 'badge',
              badgeId: bid,
              name: def?.name ?? bid,
            })
          }
        }

        dispatch({ type: 'persist', payload: next })
        if (toasts.length) dispatch({ type: 'toast', payload: toasts })
      }
      return toasts
    },
    [combined.game]
  )

  const claimDailyMission = useCallback((): boolean => {
    const today = localDateString()
    const g = combined.game
    if (g.dailyMissionClaimedForDate === today) return false
    if (g.lessonsCompletedCountThatDate < DAILY_MISSION_TARGET) return false
    const next = { ...g, dailyMissionClaimedForDate: today, xp: g.xp + 40 }
    const oldLevel = xpToLevel(g.xp)
    const newLevel = xpToLevel(next.xp)
    const toasts: ToastPayload[] = [
      { kind: 'xp', amount: 40, message: 'Daily mission bonus!' },
    ]
    if (newLevel > oldLevel) toasts.push({ kind: 'level', level: newLevel })
    dispatch({ type: 'persist', payload: next })
    dispatch({ type: 'toast', payload: toasts })
    return true
  }, [combined.game])

  const resetProgress = useCallback(() => {
    const fresh = initialPersistedState()
    dispatch({ type: 'persist', payload: fresh })
  }, [])

  const toggleSound = useCallback(() => {
    const next = { ...combined.game, soundEnabled: !combined.game.soundEnabled }
    dispatch({ type: 'persist', payload: next })
  }, [combined.game])

  const value = useMemo<GameContextValue>(
    () => ({
      state: combined.game,
      level: xpToLevel(combined.game.xp),
      completeLesson,
      claimDailyMission,
      resetProgress,
      toggleSound,
      toasts: combined.toasts,
      dismissToast,
    }),
    [
      combined.game,
      combined.toasts,
      completeLesson,
      claimDailyMission,
      resetProgress,
      toggleSound,
      dismissToast,
    ]
  )

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>
}
