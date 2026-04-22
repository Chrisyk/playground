import { Link } from 'react-router-dom'
import { questNodes, questZones } from '../data/questMap'
import { hangulLessons } from '../data/hangulLessons'
import { useGame } from '../state/useGame'

export function QuestMap() {
  const { state } = useGame()

  const lines: { x1: number; y1: number; x2: number; y2: number }[] = []
  for (const node of questNodes) {
    for (const pre of node.prerequisiteNodeIds) {
      const a = questNodes.find((n) => n.id === pre)
      if (a) {
        lines.push({
          x1: a.position.x,
          y1: a.position.y,
          x2: node.position.x,
          y2: node.position.y,
        })
      }
    }
  }

  return (
    <div className="quest-map-wrap card">
      <header className="quest-map-header">
        <h2>Seoul quest map</h2>
        <p className="muted">Tap a glowing node to enter a lesson. Locked routes await your progress.</p>
      </header>

      <div className="zone-legend">
        {questZones.map((z) => (
          <span key={z.id} className="pill zone-pill" style={{ borderColor: z.color }}>
            <span className="zone-dot" style={{ background: z.color }} />
            {z.name}
          </span>
        ))}
      </div>

      <div className="quest-map" role="img" aria-label="Quest progression map">
        <svg className="quest-map-svg" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ff6b9d" stopOpacity="0.35" />
              <stop offset="100%" stopColor="#4ecdc4" stopOpacity="0.35" />
            </linearGradient>
          </defs>
          {lines.map((ln, i) => (
            <line
              key={i}
              x1={ln.x1}
              y1={ln.y1}
              x2={ln.x2}
              y2={ln.y2}
              stroke="url(#pathGrad)"
              strokeWidth="0.9"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </svg>

        {questNodes.map((node) => {
          const unlocked = state.unlockedNodeIds.includes(node.id)
          const lesson = hangulLessons.find((l) => l.id === node.lessonId)
          const done = lesson && state.completedLessonIds.includes(lesson.id)
          const zone = questZones.find((z) => z.id === node.zoneId)
          const unmetPrerequisites = node.prerequisiteNodeIds
            .filter((id) => !state.unlockedNodeIds.includes(id))
            .map((id) => questNodes.find((n) => n.id === id)?.title)
            .filter((title): title is string => Boolean(title))
          const lockReasonId = `node-lock-reason-${node.id}`

          const cls = [
            'map-node',
            unlocked ? 'map-node-unlocked' : 'map-node-locked',
            done ? 'map-node-done' : '',
          ]
            .filter(Boolean)
            .join(' ')

          const inner = (
            <>
              <span className="map-node-orb">
                <span className="map-node-ring" style={{ borderColor: zone?.color }} />
                <span className="map-node-core">{done ? '✓' : unlocked ? '★' : '🔒'}</span>
              </span>
              <span className="map-node-label">{node.title}</span>
            </>
          )

          return (
            <div
              key={node.id}
              className={cls}
              style={{ left: `${node.position.x}%`, top: `${node.position.y}%` }}
            >
              {unlocked ? (
                <Link to={`/lesson/${node.lessonId}`} className="map-node-hit">
                  {inner}
                </Link>
              ) : (
                <div
                  className="map-node-hit"
                  aria-disabled
                  aria-label={`${node.title} is locked`}
                  aria-describedby={lockReasonId}
                  title="Complete previous quests"
                >
                  {inner}
                  <span id={lockReasonId} className="sr-only">
                    {unmetPrerequisites.length > 0
                      ? `Locked. Complete ${unmetPrerequisites.join(', ')} first.`
                      : 'Locked. Complete previous quests first.'}
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
