import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { RewardToastStack } from './components/RewardToast'
import { Home } from './pages/Home'
import { LessonPage } from './pages/LessonPage'
import { MapPage } from './pages/MapPage'
import { GameProvider } from './state/gameStore'
import './App.css'

export default function App() {
  return (
    <BrowserRouter>
      <GameProvider>
        <RewardToastStack />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/lesson/:lessonId" element={<LessonPage />} />
          </Route>
        </Routes>
      </GameProvider>
    </BrowserRouter>
  )
}
