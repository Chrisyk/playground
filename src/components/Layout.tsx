import { Link, Outlet, useLocation } from 'react-router-dom'
import { questNodes } from '../data/questMap'
import { nextLessonLink } from '../lib/nav'
import { useGame } from '../state/useGame'
import { XPHud } from './XPHud'

export function Layout() {
  const location = useLocation()
  const { state } = useGame()
  const continueLink = nextLessonLink(state)
  const nextNode = continueLink?.startsWith('/lesson/')
    ? questNodes.find((node) => `/lesson/${node.lessonId}` === continueLink)
    : null
  const activeLessonId = location.pathname.startsWith('/lesson/')
    ? location.pathname.replace('/lesson/', '')
    : null
  const activeNode = activeLessonId
    ? questNodes.find((node) => node.lessonId === activeLessonId)
    : null

  return (
    <div className="layout-root">
      <header className="app-header card">
        <Link to="/" className="brand">
          <span className="brand-icon" aria-hidden>
            ✦
          </span>
          <span className="brand-text">
            <strong>Seoul Quest</strong>
            <small>Hangul adventure</small>
          </span>
        </Link>
        <nav className="nav-links" aria-label="Main">
          <Link to="/">Home</Link>
          <Link to="/map">Quest map</Link>
        </nav>
        <XPHud />
      </header>
      <section className="app-subnav card" aria-live="polite">
        <p className="muted small">
          {activeNode
            ? `Current quest: ${activeNode.title}`
            : `Next quest: ${nextNode ? nextNode.title : 'Open map'}`}
        </p>
        {continueLink ? (
          <Link to={continueLink} className="btn btn-ghost btn-small">
            Continue quest
          </Link>
        ) : (
          <Link to="/map" className="btn btn-ghost btn-small">
            Open quest map
          </Link>
        )}
      </section>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  )
}
