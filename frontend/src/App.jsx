import { Routes, Route, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import DetailedSleepPage from './pages/DetailedSleepPage'
import AnalyticsPage from './pages/AnalyticsPage'
import LeaderboardPage from './pages/LeaderboardPage'
import ProfilePage from './pages/ProfilePage'
import LoginPage from './pages/LoginPage'
import SignUpPage from './pages/SignUpPage'
import Navigation from './components/Navigation'

function App() {
  const location = useLocation();
  const hideNavigation = ['/login', '/signup'].includes(location.pathname);

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', minHeight: '100vh', position: 'relative' }}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/sleep/:userId/:date" element={<DetailedSleepPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/leaderboard" element={<LeaderboardPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
      </Routes>
      {!hideNavigation && <Navigation />}
    </div>
  )
}

export default App