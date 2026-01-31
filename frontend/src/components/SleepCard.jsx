import { useNavigate } from 'react-router-dom';

const SleepCard = ({ user, sleepData, isCurrentUser, rank, compact = false }) => {
  const navigate = useNavigate();
  const isUp = sleepData.pointsChange !== 'down';

  const handleClick = () => {
    const dateStr = sleepData.date.split('T')[0];
    navigate(`/sleep/${user.id}/${dateStr}`);
  };

  const getCardStyle = () => {
    if (isCurrentUser) {
      return {
        ...styles.card,
        ...styles.currentUserCard,
        background: isUp ? '#FFD4C8' : '#8EB4DF',
        borderColor: isUp ? '#E33A3A' : '#5994D5',
      };
    }
    if (compact) {
      return {
        ...styles.card,
        ...styles.compactCard,
        background: isUp ? '#FFD4C8' : '#8EB4DF',
        borderColor: isUp ? '#E33A3A' : '#5994D5',
      };
    }
    return styles.card;
  };

  const getTextColor = () => {
    return isUp ? '#E33A3A' : '#5994D5';
  };

  const getRankIcon = () => {
    return isUp ? '▲' : '▼';
  };

  // Compact card for friends in the scrollable list
  if (compact && !isCurrentUser) {
    return (
      <div style={getCardStyle()} onClick={handleClick}>
        <div style={styles.leftSection}>
          <div style={styles.compactAvatarSection}>
            <span style={styles.compactAvatar}>{user.avatar || '😴'}</span>
          </div>
          <div style={styles.userInfo}>
            <span style={styles.compactUserName}>{user.name}</span>
            <span style={{ ...styles.compactStreak, color: getTextColor() }}>
              {user.streak > 0 && '🔥'} {user.streak} day streak
            </span>
          </div>
        </div>

        <div style={styles.rightSection}>
          <div style={{ ...styles.compactPointsBadge, color: getTextColor() }}>
            +{sleepData.points} points {getRankIcon()}
          </div>
          <div style={styles.compactStatsRow}>
            <span style={styles.compactStatLabel}>Slept for</span>
            <span style={styles.compactStatValue}>{sleepData.sleepHours} h</span>
          </div>
        </div>
      </div>
    );
  }

  // Full card for current user
  return (
    <div style={getCardStyle()} onClick={handleClick}>
      <div style={styles.mainUserContent}>
        <div style={styles.topRow}>
          <div style={styles.userInfoLarge}>
            <span style={styles.userNameLarge}>You</span>
            <span style={{ ...styles.streakLarge, color: getTextColor() }}>
              {user.streak > 0 && '🔥'} {user.streak} day streak
            </span>
          </div>
          <div style={{ ...styles.rankIndicator, color: getTextColor() }}>
            {getRankIcon()}
          </div>
        </div>
        
        <div style={{ ...styles.pointsLarge, color: getTextColor() }}>
          +{sleepData.points} points gained
        </div>
        
        <div style={styles.statsRowLarge}>
          <div style={styles.statLarge}>
            <span style={styles.statLabelLarge}>Slept for</span>
            <span style={styles.statValueLarge}>{sleepData.sleepHours} h</span>
          </div>
          <div style={styles.statLarge}>
            <span style={styles.statLabelLarge}>Sleep Quality</span>
            <span style={styles.statValueLarge}>{sleepData.sleepQuality}%</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  card: {
    background: 'white',
    borderRadius: '24px',
    padding: '14px 16px',
    marginBottom: '8px',
    marginLeft: '8px',
    marginRight: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: '2px solid transparent',
    fontFamily: "'Inter', sans-serif",
  },
  currentUserCard: {
    background: '#FFD4C8',
    border: '2px solid #E33A3A',
    padding: '16px',
    marginBottom: '8px',
    flexDirection: 'column',
    alignItems: 'stretch',
    minHeight: '140px',
  },
  compactCard: {
    padding: '14px 16px',
    marginBottom: '8px',
    minHeight: '70px',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  compactAvatarSection: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactAvatar: {
    fontSize: '20px',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  compactUserName: {
    fontSize: '15px',
    fontWeight: '600',
    color: '#2D3436',
  },
  compactStreak: {
    fontSize: '11px',
    fontWeight: '500',
  },
  rightSection: {
    textAlign: 'right',
  },
  compactPointsBadge: {
    fontSize: '13px',
    fontWeight: '600',
    marginBottom: '2px',
  },
  compactStatsRow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  compactStatLabel: {
    fontSize: '10px',
    color: '#636E72',
  },
  compactStatValue: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#2D3436',
  },
  // Large card styles for current user
  mainUserContent: {
    width: '100%',
  },
  topRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '8px',
  },
  userInfoLarge: {
    display: 'flex',
    flexDirection: 'column',
  },
  userNameLarge: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#2D3436',
  },
  streakLarge: {
    fontSize: '13px',
    fontWeight: '500',
  },
  rankIndicator: {
    fontSize: '18px',
  },
  pointsLarge: {
    fontSize: '22px',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '14px',
  },
  statsRowLarge: {
    display: 'flex',
    justifyContent: 'space-around',
  },
  statLarge: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  statLabelLarge: {
    fontSize: '12px',
    color: '#636E72',
    marginBottom: '2px',
  },
  statValueLarge: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#2D3436',
  },
  // Legacy styles (kept for compatibility)
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
