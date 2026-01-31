import { useNavigate } from 'react-router-dom';

const SleepCard = ({ user, sleepData, isCurrentUser, rank }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    const dateStr = sleepData.date.split('T')[0];
    navigate(`/sleep/${user.id}/${dateStr}`);
  };

  const getCardStyle = () => {
    if (isCurrentUser) {
      return {
        ...styles.card,
        ...styles.currentUserCard,
      };
    }
    return styles.card;
  };

  const getRankColor = () => {
    switch (rank) {
      case 1: return '#FF6B6B';
      case 2: return '#4ECDC4';
      case 3: return '#45B7D1';
      default: return '#636E72';
    }
  };

  const getRankIcon = () => {
    if (rank === 1) return '▲';
    if (rank <= 3) return '▲';
    return '▼';
  };

  return (
    <div style={getCardStyle()} onClick={handleClick}>
      <div style={styles.leftSection}>
        <div style={styles.avatarSection}>
          <span style={styles.avatar}>{user.avatar || '😴'}</span>
        </div>
        <div style={styles.userInfo}>
          <span style={styles.userName}>{isCurrentUser ? 'You' : user.name}</span>
          <span style={styles.streak}>
            {user.streak > 0 && '🔥'} {user.streak} day streak
          </span>
        </div>
      </div>

      <div style={styles.rightSection}>
        <div style={{ ...styles.pointsBadge, color: getRankColor() }}>
          +{sleepData.points} points {getRankIcon()}
        </div>
        <div style={styles.statsRow}>
          <div style={styles.stat}>
            <span style={styles.statLabel}>Slept for</span>
            <span style={styles.statValue}>{sleepData.sleepHours} h</span>
          </div>
          {isCurrentUser && (
            <div style={styles.stat}>
              <span style={styles.statLabel}>Sleep Quality</span>
              <span style={styles.statValue}>{sleepData.sleepQuality}%</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: 'white',
    borderRadius: '20px',
    padding: '16px 20px',
    marginBottom: '12px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: '2px solid transparent',
  },
  currentUserCard: {
    background: 'linear-gradient(135deg, #FFE5E5 0%, #FFF0F0 100%)',
    border: '2px solid #FF6B6B',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  avatarSection: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: '#F5F5F5',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    fontSize: '28px',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  userName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2D3436',
  },
  streak: {
    fontSize: '12px',
    color: '#FF6B6B',
    fontWeight: '500',
  },
  rightSection: {
    textAlign: 'right',
  },
  pointsBadge: {
    fontSize: '14px',
    fontWeight: '600',
    marginBottom: '8px',
  },
  statsRow: {
    display: 'flex',
    gap: '20px',
  },
  stat: {
    display: 'flex',
    flexDirection: 'column',
  },
  statLabel: {
    fontSize: '11px',
    color: '#636E72',
  },
  statValue: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2D3436',
  },
};

export default SleepCard;
