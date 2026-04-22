/** Seoul Quest — core domain types */

export type StepKind = 'intro' | 'quiz' | 'timed_quiz' | 'boss'

export interface IntroStep {
  kind: 'intro'
  id: string
  title: string
  body: string
  /** Short flavor line for the adventure */
  story?: string
}

export interface QuizStep {
  kind: 'quiz' | 'timed_quiz' | 'boss'
  id: string
  prompt: string
  hint?: string
  choices: string[]
  answerIndex: number
  /** Seconds; only for timed_quiz */
  timeLimitSec?: number
  /** Boss rounds may award bonus XP */
  bonusXp?: number
}

export type LessonStep = IntroStep | QuizStep

export interface Lesson {
  id: string
  title: string
  subtitle: string
  zoneId: string
  /** Base XP granted on full completion */
  xpReward: number
  steps: LessonStep[]
}

export interface QuestZone {
  id: string
  name: string
  tagline: string
  color: string
}

export interface QuestNode {
  id: string
  zoneId: string
  title: string
  lessonId: string
  /** Percent positions for map layout (0–100) */
  position: { x: number; y: number }
  prerequisiteNodeIds: string[]
}

export interface BadgeDef {
  id: string
  name: string
  description: string
  icon: string
}

export interface PersistedGameState {
  version: 1
  xp: number
  completedLessonIds: string[]
  unlockedNodeIds: string[]
  earnedBadgeIds: string[]
  lastPlayLocalDate: string | null
  streakDays: number
  soundEnabled: boolean
  lessonsCompletedOnDate: string | null
  lessonsCompletedCountThatDate: number
  dailyMissionClaimedForDate: string | null
}

export const STORAGE_KEY = 'seoul-quest-save-v1'

export const DAILY_MISSION_TARGET = 2
