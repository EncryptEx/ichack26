import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import DetailedSleepPage from './pages/DetailedSleepPage'
import AnalyticsPage from './pages/AnalyticsPage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'
import Navigation from './components/Navigation'

function App() {
  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', position: 'relative' }}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sleep/:userId/:date" element={<DetailedSleepPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
      <Navigation />
    </div>
  )
}

export default App
