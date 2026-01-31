import { ArrowLeft, TrendingUp, Moon, Zap, Target, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { currentUser, weeklyStats } from '../data/mockData';

const AnalyticsPage = () => {
  const navigate = useNavigate();

  const weekData = [
    { day: 'Mon', hours: 7.2, quality: 68 },
    { day: 'Tue', hours: 8.3, quality: 72 },
    { day: 'Wed', hours: 6.5, quality: 58 },
    { day: 'Thu', hours: 7.8, quality: 75 },
    { day: 'Fri', hours: 8.1, quality: 80 },
    { day: 'Sat', hours: 9.2, quality: 85 },
    { day: 'Sun', hours: 7.5, quality: 70 },
  ];

  const maxHours = Math.max(...weekData.map(d => d.hours));

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backButton}>
          <ArrowLeft size={24} />
        </button>
        <h1 style={styles.title}>My Analytics</h1>
        <div style={{ width: 40 }} />
      </header>

      <div style={styles.summaryCard}>
        <div style={styles.avatarLarge}>{currentUser.avatar || '😴'}</div>
        <h2 style={styles.userName}>{currentUser.name}</h2>
        <p style={styles.streakLarge}>🔥 {currentUser.streak} day streak</p>
        <div style={styles.totalPoints}>
          <span style={styles.totalPointsValue}>{weeklyStats.totalPoints}</span>
          <span style={styles.totalPointsLabel}>Total Points This Week</span>
        </div>
      </div>

      <div style={styles.weekChart}>
        <h3 style={styles.sectionTitle}>
          <Calendar size={20} style={{ marginRight: 8 }} />
          This Week
        </h3>
        <div style={styles.chartContainer}>
          {weekData.map((day) => (
            <div key={day.day} style={styles.chartBar}>
              <div style={styles.barWrapper}>
                <div 
                  style={{
                    ...styles.bar,
                    height: `${(day.hours / maxHours) * 100}%`,
                    background: day.hours >= 7 ? '#00B894' : day.hours >= 6 ? '#FDCB6E' : '#FF6B6B',
                  }}
                />
              </div>
              <span style={styles.barLabel}>{day.day}</span>
              <span style={styles.barValue}>{day.hours}h</span>
            </div>
          ))}
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <Moon size={28} color="#6C5CE7" />
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{weeklyStats.avgSleepHours}h</span>
            <span style={styles.statLabel}>Avg. Sleep</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <Zap size={28} color="#E17055" />
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{weeklyStats.avgQuality}%</span>
            <span style={styles.statLabel}>Avg. Quality</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <TrendingUp size={28} color="#00B894" />
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{weeklyStats.consistency}%</span>
            <span style={styles.statLabel}>Consistency</span>
          </div>
        </div>
        <div style={styles.statCard}>
          <Target size={28} color="#FDCB6E" />
          <div style={styles.statInfo}>
            <span style={styles.statValue}>{weeklyStats.bestDay}</span>
            <span style={styles.statLabel}>Best Day</span>
          </div>
        </div>
      </div>

      <div style={styles.goalsCard}>
        <h3 style={styles.sectionTitle}>
          <Target size={20} style={{ marginRight: 8 }} />
          Sleep Goals
        </h3>
        <div style={styles.goalItem}>
          <div style={styles.goalInfo}>
            <span style={styles.goalTitle}>Sleep 8+ hours</span>
            <span style={styles.goalProgress}>3/7 days</span>
          </div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: '43%' }} />
          </div>
        </div>
        <div style={styles.goalItem}>
          <div style={styles.goalInfo}>
            <span style={styles.goalTitle}>Sleep before 11pm</span>
            <span style={styles.goalProgress}>5/7 days</span>
          </div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: '71%' }} />
          </div>
        </div>
        <div style={styles.goalItem}>
          <div style={styles.goalInfo}>
            <span style={styles.goalTitle}>Quality above 70%</span>
            <span style={styles.goalProgress}>4/7 days</span>
          </div>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: '57%' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #F5D799 0%, #FFF8E7 30%)',
    paddingBottom: '100px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px',
    paddingTop: '40px',
  },
  backButton: {
    background: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#2D3436',
  },
  summaryCard: {
    background: 'white',
    borderRadius: '24px',
    padding: '30px',
    margin: '0 20px 20px',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  avatarLarge: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: '#F5D799',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '40px',
    margin: '0 auto 12px',
  },
  userName: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: '4px',
  },
  streakLarge: {
    fontSize: '16px',
    color: '#FF6B6B',
    fontWeight: '500',
    marginBottom: '20px',
  },
  totalPoints: {
    background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
    borderRadius: '16px',
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
  },
  totalPointsValue: {
    fontSize: '32px',
    fontWeight: '700',
    color: 'white',
  },
  totalPointsLabel: {
    fontSize: '12px',
    color: 'white',
    opacity: 0.9,
  },
  weekChart: {
    background: 'white',
    borderRadius: '24px',
    padding: '20px',
    margin: '0 20px 20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
  },
  chartContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: '150px',
  },
  chartBar: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    flex: 1,
  },
  barWrapper: {
    width: '20px',
    height: '100px',
    background: '#F0F0F0',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'flex-end',
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: '10px',
    transition: 'height 0.3s ease',
  },
  barLabel: {
    fontSize: '11px',
    color: '#636E72',
    marginTop: '8px',
  },
  barValue: {
    fontSize: '10px',
    color: '#2D3436',
    fontWeight: '600',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    padding: '0 20px',
    marginBottom: '20px',
  },
  statCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  statInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  statValue: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#2D3436',
  },
  statLabel: {
    fontSize: '11px',
    color: '#636E72',
  },
  goalsCard: {
    background: 'white',
    borderRadius: '24px',
    padding: '20px',
    margin: '0 20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  goalItem: {
    marginBottom: '16px',
  },
  goalInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  goalTitle: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#2D3436',
  },
  goalProgress: {
    fontSize: '12px',
    color: '#636E72',
  },
  progressBar: {
    height: '8px',
    background: '#F0F0F0',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #FF6B6B 0%, #FDCB6E 100%)',
    borderRadius: '4px',
  },
};

export default AnalyticsPage;
