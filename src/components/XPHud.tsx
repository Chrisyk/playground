import { xpWithinLevel } from '../lib/progression'
import { useGame } from '../state/useGame'

export function XPHud() {
  const { state, level } = useGame()
  const { current, next } = xpWithinLevel(state.xp)
  const pct = next > 0 ? Math.min(100, (current / next) * 100) : 100

  return (
    <div className="xp-hud" aria-live="polite">
      <div className="xp-hud-row">
        <span className="pill">Lv {level}</span>
        <span className="xp-hud-val">{state.xp} XP</span>
      </div>
      <div className="xp-bar" role="progressbar" aria-valuenow={current} aria-valuemin={0} aria-valuemax={next}>
        <div className="xp-bar-fill" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
