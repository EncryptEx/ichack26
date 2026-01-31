import { ArrowLeft, Trophy, Medal, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { currentUser, friends, generateSleepData } from '../data/mockData';

const LeaderboardPage = () => {
  const navigate = useNavigate();

  // Calculate total points for the week
  const calculateWeeklyPoints = (userId) => {
    let total = 0;
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      total += generateSleepData(userId, date).points;
    }
    return total;
  };

  const allUsers = [currentUser, ...friends];
  const rankedUsers = allUsers
    .map(user => ({
      ...user,
      weeklyPoints: calculateWeeklyPoints(user.id),
    }))
    .sort((a, b) => b.weeklyPoints - a.weeklyPoints);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown size={24} color="#FFD700" fill="#FFD700" />;
      case 2: return <Medal size={24} color="#C0C0C0" />;
      case 3: return <Medal size={24} color="#CD7F32" />;
      default: return <span style={styles.rankNumber}>{rank}</span>;
    }
  };

  const getRankStyle = (rank) => {
    switch (rank) {
      case 1: return styles.firstPlace;
      case 2: return styles.secondPlace;
      case 3: return styles.thirdPlace;
      default: return {};
    }
  };

  const topThree = rankedUsers.slice(0, 3);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backButton}>
          <ArrowLeft size={24} />
        </button>
        <h1 style={styles.title}>Leaderboard</h1>
        <div style={{ width: 40 }} />
      </header>

      <div style={styles.periodSelector}>
        <button style={{ ...styles.periodButton, ...styles.activePeriod }}>This Week</button>
        <button style={styles.periodButton}>This Month</button>
        <button style={styles.periodButton}>All Time</button>
      </div>

      <div style={styles.podium}>
        {/* Second Place */}
        <div style={styles.podiumItem}>
          <div style={{ ...styles.podiumAvatar, ...styles.secondPlaceAvatar }}>
            {topThree[1]?.avatar || '😴'}
          </div>
          <span style={styles.podiumName}>{topThree[1]?.name}</span>
          <span style={styles.podiumPoints}>{topThree[1]?.weeklyPoints} pts</span>
          <div style={{ ...styles.podiumBar, height: '60px', background: '#C0C0C0' }}>
            <span style={styles.podiumRank}>2</span>
          </div>
        </div>

        {/* First Place */}
        <div style={styles.podiumItem}>
          <Crown size={32} color="#FFD700" fill="#FFD700" style={styles.crown} />
          <div style={{ ...styles.podiumAvatar, ...styles.firstPlaceAvatar }}>
            {topThree[0]?.avatar || '😴'}
          </div>
          <span style={styles.podiumName}>{topThree[0]?.name}</span>
          <span style={styles.podiumPoints}>{topThree[0]?.weeklyPoints} pts</span>
          <div style={{ ...styles.podiumBar, height: '90px', background: '#FFD700' }}>
            <span style={styles.podiumRank}>1</span>
          </div>
        </div>

        {/* Third Place */}
        <div style={styles.podiumItem}>
          <div style={{ ...styles.podiumAvatar, ...styles.thirdPlaceAvatar }}>
            {topThree[2]?.avatar || '😴'}
          </div>
          <span style={styles.podiumName}>{topThree[2]?.name}</span>
          <span style={styles.podiumPoints}>{topThree[2]?.weeklyPoints} pts</span>
          <div style={{ ...styles.podiumBar, height: '40px', background: '#CD7F32' }}>
            <span style={styles.podiumRank}>3</span>
          </div>
        </div>
      </div>

      <div style={styles.leaderboardList}>
        {rankedUsers.map((user, index) => {
          const rank = index + 1;
          const isCurrentUser = user.id === currentUser.id;
          
          return (
            <div 
              key={user.id} 
              style={{
                ...styles.leaderboardItem,
                ...(isCurrentUser ? styles.currentUserItem : {}),
                ...getRankStyle(rank),
              }}
            >
              <div style={styles.rankBadge}>
                {getRankIcon(rank)}
              </div>
              <div style={styles.userAvatar}>{user.avatar || '😴'}</div>
              <div style={styles.userInfo}>
                <span style={styles.userName}>
                  {isCurrentUser ? 'You' : user.name}
                </span>
                <span style={styles.userStreak}>🔥 {user.streak} day streak</span>
              </div>
              <div style={styles.pointsBadge}>
                <span style={styles.pointsValue}>{user.weeklyPoints}</span>
                <span style={styles.pointsLabel}>pts</span>
              </div>
            </div>
          );
        })}
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
  periodSelector: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    padding: '0 20px 20px',
  },
  periodButton: {
    padding: '10px 16px',
    borderRadius: '20px',
    border: 'none',
    background: 'white',
    fontSize: '13px',
    fontWeight: '500',
    color: '#636E72',
    cursor: 'pointer',
    fontFamily: 'Poppins, sans-serif',
  },
  activePeriod: {
    background: '#2D3436',
    color: 'white',
  },
  podium: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: '20px',
    marginBottom: '20px',
  },
  podiumItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    margin: '0 10px',
  },
  crown: {
    marginBottom: '8px',
  },
  podiumAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '30px',
    marginBottom: '8px',
    border: '3px solid white',
    boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
  },
  firstPlaceAvatar: {
    width: '80px',
    height: '80px',
    fontSize: '40px',
    background: '#FFF9E6',
  },
  secondPlaceAvatar: {
    background: '#F5F5F5',
  },
  thirdPlaceAvatar: {
    background: '#FFF0E6',
  },
  podiumName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: '4px',
  },
  podiumPoints: {
    fontSize: '12px',
    color: '#636E72',
    marginBottom: '8px',
  },
  podiumBar: {
    width: '80px',
    borderRadius: '10px 10px 0 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  podiumRank: {
    fontSize: '24px',
    fontWeight: '700',
    color: 'white',
  },
  leaderboardList: {
    padding: '0 20px',
  },
  leaderboardItem: {
    display: 'flex',
    alignItems: 'center',
    background: 'white',
    borderRadius: '16px',
    padding: '12px 16px',
    marginBottom: '10px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  currentUserItem: {
    background: 'linear-gradient(135deg, #FFE5E5 0%, #FFF0F0 100%)',
    border: '2px solid #FF6B6B',
  },
  firstPlace: {
    background: 'linear-gradient(135deg, #FFF9E6 0%, #FFFDF5 100%)',
    border: '2px solid #FFD700',
  },
  secondPlace: {
    background: 'linear-gradient(135deg, #F8F8F8 0%, #FFFFFF 100%)',
    border: '2px solid #C0C0C0',
  },
  thirdPlace: {
    background: 'linear-gradient(135deg, #FFF5EB 0%, #FFFAF5 100%)',
    border: '2px solid #CD7F32',
  },
  rankBadge: {
    width: '32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rankNumber: {
    fontSize: '16px',
    fontWeight: '700',
    color: '#636E72',
  },
  userAvatar: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: '#F5F5F5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '24px',
    marginLeft: '12px',
  },
  userInfo: {
    flex: 1,
    marginLeft: '12px',
  },
  userName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#2D3436',
    display: 'block',
  },
  userStreak: {
    fontSize: '12px',
    color: '#FF6B6B',
  },
  pointsBadge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  pointsValue: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#2D3436',
  },
  pointsLabel: {
    fontSize: '11px',
    color: '#636E72',
  },
};

export default LeaderboardPage;
