import { useContext } from 'react'
import { GameContext, type GameContextValue } from './gameContext'

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext)
  if (!ctx) throw new Error('useGame must be used within GameProvider')
  return ctx
}
