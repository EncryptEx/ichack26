import { Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { currentUser, friends, generateSleepData } from '../data/mockData';

const LeaderboardPage = () => {
  const navigate = useNavigate();

  // 1. Calculate Points
  const calculateWeeklyPoints = (userId) => {
    let total = 0;
    const today = new Date();
    // Use a fixed seed or day to make leaderboard stable for demo
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
      points: calculateWeeklyPoints(user.id),
      level: 'Good Sleeper', // Mock level
    }))
    .sort((a, b) => b.points - a.points); // Descending

  // 2. Separate Podium (Top 3) & List (Rest)
  // Podium Order Implementation: [Third (Left), Second (Middle), First (Right)]
  // Wait, standard podium is 2 - 1 - 3 (Left-Center-Right).
  // BUT the user attached an image where:
  // Left: #3 (Shortest)
  // Middle: #2 (Medium)
  // Right: #1 (Tallest)
  // This is a rising graph style.
  // I will implement this Rising Graph style (3-2-1) as requested by the specific image.
  
  const third = rankedUsers[2];
  const second = rankedUsers[1];
  const winner = rankedUsers[0];
  const restOfUsers = rankedUsers.slice(3);

  // Find Current User Stats for the Floating Card
  const myRankIndex = rankedUsers.findIndex(u => u.id === currentUser.id);
  const myData = rankedUsers[myRankIndex];
  const myRank = myRankIndex + 1;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Leaderboard</h1>
      </header>

      {/* Podium Section - Rising Graph Order: 3 -> 2 -> 1 */}
      <div style={styles.podiumContainer}>
        {/* Third Place (Left) */}
        <div style={styles.podiumColumn}>
          <div style={styles.podiumAvatarWrapper}>
             <span style={styles.podiumAvatar}>{third.avatar}</span>
          </div>
          <span style={styles.podiumName}>{third.name}</span>
          <span style={styles.podiumPoints}>{third.points} pts</span>
          <div style={{...styles.podiumBar, ...styles.barThird}}>
            <span style={styles.rankNumberInBar}>3</span>
          </div>
        </div>

        {/* Second Place (Middle) */}
        <div style={styles.podiumColumn}>
          <div style={styles.podiumAvatarWrapper}>
             <span style={styles.podiumAvatar}>{second.avatar}</span>
          </div>
          <span style={styles.podiumName}>{second.name}</span>
          <span style={styles.podiumPoints}>{second.points} pts</span>
          <div style={{...styles.podiumBar, ...styles.barSecond}}>
            <span style={styles.rankNumberInBar}>2</span>
          </div>
        </div>

        {/* First Place (Right) */}
        <div style={styles.podiumColumn}>
          <div style={styles.podiumAvatarWrapper}>
             <span style={styles.podiumAvatar}>{winner.avatar}</span>
             <Crown size={20} color="#2D3436" fill="#2D3436" style={styles.crownIcon} />
          </div>
          <span style={styles.podiumName}>{winner.name}</span>
          <span style={styles.podiumPoints}>{winner.points} pts</span>
          <div style={{...styles.podiumBar, ...styles.barFirst}}>
            <span style={styles.rankNumberInBar}>1</span>
          </div>
        </div>
      </div>

      {/* Floating User Stats Card */}
      <div style={styles.userStatsCard}>
        <div style={styles.userCardLeft}>
            <div style={styles.userCardAvatar}>{myData.avatar}</div>
            <span style={styles.userCardName}>{myData.name}</span>
        </div>
        <div style={styles.userCardStats}>
             <div style={styles.statBox}>
                 <span style={styles.statLabel}>Points:</span>
                 <span style={styles.statValue}>{myData.points}</span>
             </div>
             <div style={styles.statBox}>
                 <span style={styles.statLabel}>Level:</span>
                 <span style={styles.statValue}>Silver ♛</span>
             </div>
             <div style={styles.statBox}>
                 <span style={styles.statLabel}>Position:</span>
                 <span style={styles.statValue}>{myRank}</span>
             </div>
        </div>
      </div>

      {/* Scrollable List */}
      <div style={styles.listContainer}>
        {restOfUsers.map((user, index) => (
          <div key={user.id} style={styles.listItem}>
            <span style={styles.listRank}>{String(index + 4).padStart(2, '0')}</span>
            
            <div style={styles.listInfo}>
              <span style={styles.listName}>{user.name}</span>
              <span style={styles.listPoints}>{user.points} points</span>
            </div>
            
            {/* Crown Icon Placeholder (Moved to Left via styles order) */}
            <div style={styles.listIcon}>
                <Crown size={24} color="#FFD700" fill="#FFD700" /> 
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#FFF9EE', // App Beige
    color: '#2D3436',
    fontFamily: "'Inter', sans-serif",
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden' 
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 36px 0',
  },
  backButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '0',
  },
  title: {
    fontSize: '34px',
  },
  
  // Podium
  podiumContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    gap: '12px',
    paddingTop: '20px',
    paddingBottom: '40px', 
    marginTop: '20px',
    paddingLeft: '12px', // Add slight padding to match centered feel
    paddingRight: '12px'
  },
  podiumColumn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    width: '90px',
  },
  podiumAvatarWrapper: {
    position: 'relative',
    marginBottom: '12px',
  },
  podiumAvatar: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    // No grayscale
    background: '#fff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '32px',
    objectFit: 'cover',
    boxShadow: '0 8px 20px -4px rgba(0,0,0,0.15)',
    border: '4px solid white',
  },
  crownIcon: {
    position: 'absolute',
    top: '-24px',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  podiumName: {
    fontSize: '13px',
    fontWeight: '700',
    marginBottom: '4px',
    color: '#2D3436',
    textAlign: 'center',
    lineHeight: '1.2'
  },
  podiumPoints: {
    fontSize: '11px',
    fontWeight: '600',
    color: '#8A7A5A', // Muted Gold
    marginBottom: '8px',
  },
  podiumBar: {
    width: '100%',
    borderRadius: '16px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center', // Center vertically
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
  },
  // Rising Graph Steps with App Colors
  barThird: { height: '110px', background: 'linear-gradient(180deg, #FFF0D4 0%, #FFFAF0 100%)', border: '1px solid rgba(255,240,212, 1)' }, 
  barSecond: { height: '150px', background: 'linear-gradient(180deg, #FFE0B2 0%, #FFECD0 100%)', border: '1px solid rgba(255,224,178, 1)' }, 
  barFirst: { height: '190px', background: 'linear-gradient(180deg, #FFCA5F 0%, #FFD680 100%)', border: '1px solid rgba(255,202,95, 1)' }, 
  
  rankNumberInBar: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#2D3436', 
    opacity: 0.15,
    fontFamily: "'Lora', serif"
  },

  // Floating Card
  userStatsCard: {
    background: '#97AF68', // Analytics Green
    margin: '-20px 36px 32px', 
    padding: '24px 32px', 
    borderRadius: '32px',
    display: 'flex',
    justifyContent: 'center', 
    alignItems: 'center',
    color: 'white',
    boxShadow: '0 20px 40px -10px rgba(151, 175, 104, 0.4)', // Matching shadow
    zIndex: 10,
    gap: '32px',
    position: 'relative',
    overflow: 'hidden'
  },
  userCardLeft: {
     display: 'flex',
     flexDirection: 'column',
     alignItems: 'center',
     gap: '8px',
     // Removed border and margin right to center everything better
  },
  userCardAvatar: {
      fontSize: '28px',
      width: '56px', 
      height: '56px',
      borderRadius: '50%',
      background: 'rgba(255,255,255,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
  },
  userCardName: {
      fontSize: '15px',
      fontWeight: '700'
  },
  userCardStats: {
      display: 'flex',
      justifyContent: 'center', 
      gap: '24px',
      flex: 1 // Allow centering to work better
  },
  statBox: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px'
  },
  statLabel: {
    fontSize: '11px',
    color: 'rgba(255,255,255,0.8)', // Lighter for green bg
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  statValue: {
      fontSize: '16px',
      fontWeight: '700',
      color: 'white'
  },

  // List
  listContainer: {
    flex: 1,
    padding: '0 32px 100px', // Slightly less padding for cards to fit nicely
    overflowY: 'auto'
  },
  listItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '16px 8px',
    marginBottom: '8px',
    background: 'white',
    borderRadius: '20px',
    boxShadow: '0 4px 15px rgba(0,0,0,0.02)'
  },
  listRank: {
    fontSize: '18px',
    fontWeight: '700', 
    color: '#B2BEC3',
    width: '40px',
    textAlign: 'center',
    fontFamily: "'Lora', serif" 
  },
  listInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end', // Push text to the right
    paddingRight: '12px'
  },
  listName: {
    fontSize: '18px', // Bigger
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: '2px',
    textAlign: 'right'
  },
  listPoints: {
    fontSize: '14px', // Bigger
    fontWeight: '500',
    color: '#B2BEC3',
    textAlign: 'right'
  },
  listIcon: {
      opacity: 0.8,
      marginRight: 'auto', // Push to the left (order in flex container matters)
      order: -1, // Make sure it shows up first/left
      marginLeft: '12px'
  }
};

export default LeaderboardPage;
