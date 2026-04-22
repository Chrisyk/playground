import { Link } from 'react-router-dom'
import { badgeCatalog } from '../data/questMap'
import { hangulLessons } from '../data/hangulLessons'
import { DAILY_MISSION_TARGET } from '../types/game'
import { localDateString } from '../lib/progression'
import { nextLessonLink } from '../lib/nav'
import { useGame } from '../state/useGame'

export function Home() {
  const { state, level, claimDailyMission, resetProgress, toggleSound } = useGame()
  const today = localDateString()
  const cont = nextLessonLink(state)
  const dailyProgress =
    state.lessonsCompletedOnDate === today ? state.lessonsCompletedCountThatDate : 0
  const canClaim =
    dailyProgress >= DAILY_MISSION_TARGET &&
    state.dailyMissionClaimedForDate !== today
  const alreadyClaimed = state.dailyMissionClaimedForDate === today
  const lessonsRemaining = Math.max(DAILY_MISSION_TARGET - dailyProgress, 0)
  const dailyStatusId = 'daily-mission-status'

  const dailyCtaLabel = alreadyClaimed
    ? 'Bonus claimed today'
    : dailyProgress < DAILY_MISSION_TARGET
      ? `Earn bonus at ${DAILY_MISSION_TARGET} lessons`
      : 'Claim +40 XP bonus'

  const dailyStatusMessage = alreadyClaimed
    ? 'Daily bonus already claimed. Come back tomorrow for a new mission reward.'
    : canClaim
      ? 'Daily mission complete. Claim your +40 XP bonus now.'
      : `${lessonsRemaining} lesson${lessonsRemaining === 1 ? '' : 's'} to go before bonus unlocks.`

  const earnedSet = new Set(state.earnedBadgeIds)

  return (
    <div className="home-page">
      <section className="hero card">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Creative mode: story + drills</p>
            <h1>
              Learn Hangul on a neon quest through <em>Seoul</em>.
            </h1>
            <p className="lead muted">
              Unlock districts, earn badges, and level up as you master jamo, vowels, and syllable
              blocks — all saved locally in your browser.
            </p>
            <div className="hero-actions">
              {cont ? (
                <Link to={cont} className="btn btn-primary">
                  Continue quest
                </Link>
              ) : null}
              <Link
                to="/map"
                className="btn btn-ghost btn-icon"
                aria-label="Open quest map"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M14.106 5.553a2 2 0 0 0 1.788 0l3.659-1.83A1 1 0 0 1 21 4.619v12.764a1 1 0 0 1-.553.894l-4.553 2.277a2 2 0 0 1-1.788 0l-4.212-2.106a2 2 0 0 0-1.788 0l-4.212 2.106a2 2 0 0 1-1.788 0L2.894 18.553A1 1 0 0 1 2.25 17.659V4.895a1 1 0 0 1 .553-.894l4.553-2.277a2 2 0 0 1 1.788 0l4.212 2.106a2 2 0 0 0 1.788 0l4.212-2.106z" />
                  <path d="M15 5.764v15" />
                  <path d="M9 3.236v15" />
                </svg>
              </Link>
            </div>
          </div>
          <div className="hero-panel">
            <div className="hero-stat card inner-card">
              <span className="muted">Adventurer level</span>
              <strong className="hero-lv">{level}</strong>
              <span className="pill streak-pill" title="Consecutive days with a completed lesson">
                🔥 {state.streakDays} day streak
              </span>
            </div>
            <div className="hero-stat card inner-card daily-card">
              <span className="muted">Daily mission</span>
              <p>
                Complete <strong>{DAILY_MISSION_TARGET}</strong> lessons today (
                {dailyProgress}/{DAILY_MISSION_TARGET}).
              </p>
              <button
                type="button"
                className="btn btn-primary btn-small"
                disabled={!canClaim}
                aria-describedby={dailyStatusId}
                onClick={() => claimDailyMission()}
              >
                {dailyCtaLabel}
              </button>
              <p id={dailyStatusId} className="muted small daily-status" aria-live="polite">
                {dailyStatusMessage}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="badges-section card">
        <div className="section-head">
          <h2>Badge case</h2>
          <p className="muted">Collectibles earned through your journey.</p>
        </div>
        <ul className="badge-grid">
          {badgeCatalog.map((b) => {
            const on = earnedSet.has(b.id)
            return (
              <li key={b.id} className={`badge-tile ${on ? 'badge-tile-on' : 'badge-tile-off'}`}>
                <span className="badge-icon" aria-hidden>
                  {on ? b.icon : '?'}
                </span>
                <div>
                  <strong>{b.name}</strong>
                  <p className="muted small">{b.description}</p>
                </div>
              </li>
            )
          })}
        </ul>
      </section>

      <section className="meta-bar card">
        <div className="meta-row">
          <span className="muted">
            Lessons cleared: {state.completedLessonIds.length}/{hangulLessons.length}
          </span>
          <div className="meta-actions">
            <button type="button" className="btn btn-ghost btn-small" onClick={toggleSound}>
              Sound: {state.soundEnabled ? 'on' : 'off'}
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-small danger"
              onClick={() => {
                if (confirm('Reset all Seoul Quest progress on this device?')) resetProgress()
              }}
            >
              Reset progress
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
