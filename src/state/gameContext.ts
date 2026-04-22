import { createContext } from 'react'
import type { PersistedGameState } from '../types/game'
import type { ToastItem, ToastPayload } from '../types/toast'

export interface GameContextValue {
  state: PersistedGameState
  level: number
  completeLesson: (lessonId: string, bonusXp?: number) => ToastPayload[]
  claimDailyMission: () => boolean
  resetProgress: () => void
  toggleSound: () => void
  toasts: ToastItem[]
  dismissToast: (id: string) => void
}

export const GameContext = createContext<GameContextValue | null>(null)
