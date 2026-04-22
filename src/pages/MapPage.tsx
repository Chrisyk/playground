import { QuestMap } from '../components/QuestMap'

export function MapPage() {
  return (
    <div className="map-page">
      <header className="page-head">
        <h1>Quest map</h1>
        <p className="muted">Follow the path from Hongdae to the summit — each node is a Hangul trial.</p>
      </header>
      <QuestMap />
    </div>
  )
}
