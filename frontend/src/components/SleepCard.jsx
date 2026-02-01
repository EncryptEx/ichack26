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
        background: isUp ? '#FFE0DC' : '#DCE9F5',
        borderColor: isUp ? '#E54D4D' : '#5B93CC',
      };
    }
    if (compact) {
      return {
        ...styles.card,
        ...styles.compactCard,
        background: isUp ? '#FFE0DC' : '#DCE9F5',
        borderColor: isUp ? '#E54D4D' : '#5B93CC',
      };
    }
    return styles.card;
  };

  const getTextColor = () => {
    return isUp ? '#E54D4D' : '#5B93CC';
  };

  const getRankIcon = () => {
    return isUp ? '▲' : '▼';
  };

  // Compact card for friends in the scrollable list
  if (compact && !isCurrentUser) {
    const hasStreak = user.streak >= 3;
    return (
      <div style={getCardStyle()} onClick={handleClick}>
        <div style={styles.leftSection}>
          <div style={styles.avatarWrapper}>
            <div style={styles.compactAvatarSection}>
              <span style={styles.compactAvatar}>{user.avatar || '😴'}</span>
            </div>
            {hasStreak && <span style={styles.fireEmoji}>🔥</span>}
          </div>
          <div style={styles.userInfo}>
            <span style={styles.compactUserName}>{user.name}</span>
            <span style={{ ...styles.compactStreak, color: hasStreak ? getTextColor() : '#9B9B9B' }}>
              {user.streak} day streak
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
  const hasStreak = user.streak >= 3;
  return (
    <div style={getCardStyle()} onClick={handleClick}>
      <div style={styles.mainUserContent}>
        <div style={styles.topRow}>
          <div style={styles.userInfoLarge}>
            <span style={styles.userNameLarge}>You</span>
            <span style={{ ...styles.streakLarge, color: hasStreak ? getTextColor() : '#9B9B9B' }}>
              {hasStreak && '🔥'} {user.streak} day streak
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
    borderRadius: '28px',
    padding: '18px 20px',
    marginBottom: '12px',
    marginLeft: '0',
    marginRight: '0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: '3px solid transparent',
    fontFamily: "'Inter', sans-serif",
  },
  currentUserCard: {
    background: '#FFE0DC',
    border: '3px solid #E54D4D',
    padding: '20px 22px',
    marginBottom: '14px',
    flexDirection: 'column',
    alignItems: 'stretch',
    minHeight: '170px',
    borderRadius: '28px',
  },
  compactCard: {
    padding: '16px 20px',
    marginBottom: '12px',
    minHeight: '90px',
    border: '3px solid',
    borderRadius: '28px',
  },
  avatarWrapper: {
    position: 'relative',
    width: '52px',
    height: '52px',
  },
  fireEmoji: {
    position: 'absolute',
    bottom: '-4px',
    right: '-6px',
    fontSize: '18px',
  },
  leftSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  compactAvatarSection: {
    width: '52px',
    height: '52px',
    borderRadius: '50%',
    background: 'rgba(255, 255, 255, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  compactAvatar: {
    fontSize: '26px',
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column',
  },
  compactUserName: {
    fontSize: '17px',
    fontWeight: '700',
    color: '#2D3436',
  },
  compactStreak: {
    fontSize: '13px',
    fontWeight: '600',
  },
  rightSection: {
    textAlign: 'right',
  },
  compactPointsBadge: {
    fontSize: '15px',
    fontWeight: '700',
    marginBottom: '4px',
  },
  compactStatsRow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  },
  compactStatLabel: {
    fontSize: '12px',
    color: '#636E72',
    fontWeight: '500',
  },
  compactStatValue: {
    fontSize: '15px',
    fontWeight: '700',
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
    marginBottom: '10px',
  },
  userInfoLarge: {
    display: 'flex',
    flexDirection: 'column',
  },
  userNameLarge: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#2D3436',
  },
  streakLarge: {
    fontSize: '15px',
    fontWeight: '600',
  },
  rankIndicator: {
    fontSize: '20px',
  },
  pointsLarge: {
    fontSize: '26px',
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: '16px',
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
    fontSize: '14px',
    color: '#636E72',
    marginBottom: '4px',
    fontWeight: '500',
  },
  statValueLarge: {
    fontSize: '22px',
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
