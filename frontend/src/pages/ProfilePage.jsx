import { useState } from 'react';
import { ArrowLeft, Settings, Bell, Moon, Users, LogOut, ChevronRight, Edit2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { currentUser, friends, weeklyStats } from '../data/mockData';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const menuItems = [
    { icon: Bell, label: 'Notifications', toggle: true, value: notifications, onChange: setNotifications },
    { icon: Moon, label: 'Dark Mode', toggle: true, value: darkMode, onChange: setDarkMode },
    { icon: Users, label: 'Manage Friends', action: true },
    { icon: Settings, label: 'Settings', action: true },
    { icon: LogOut, label: 'Log Out', action: true, danger: true },
  ];

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backButton}>
          <ArrowLeft size={24} />
        </button>
        <h1 style={styles.title}>Profile</h1>
        <button style={styles.editButton}>
          <Edit2 size={20} />
        </button>
      </header>

      <div style={styles.profileCard}>
        <div style={styles.avatarWrapper}>
          <div style={styles.avatarLarge}>{currentUser.avatar || '😴'}</div>
          <button style={styles.avatarEditButton}>
            <Edit2 size={14} />
          </button>
        </div>
        <h2 style={styles.userName}>{currentUser.name}</h2>
        <p style={styles.userHandle}>@{currentUser.name.toLowerCase()}</p>
        <p style={styles.streakLarge}>🔥 {currentUser.streak} day streak</p>
        
        <div style={styles.statsRow}>
          <div style={styles.profileStat}>
            <span style={styles.profileStatValue}>{friends.length}</span>
            <span style={styles.profileStatLabel}>Friends</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.profileStat}>
            <span style={styles.profileStatValue}>{weeklyStats.totalPoints}</span>
            <span style={styles.profileStatLabel}>Weekly Points</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.profileStat}>
            <span style={styles.profileStatValue}>#2</span>
            <span style={styles.profileStatLabel}>Rank</span>
          </div>
        </div>
      </div>

      <div style={styles.achievementsCard}>
        <h3 style={styles.sectionTitle}>Achievements</h3>
        <div style={styles.achievementsGrid}>
          <div style={styles.achievement}>
            <span style={styles.achievementIcon}>🏆</span>
            <span style={styles.achievementLabel}>First Win</span>
          </div>
          <div style={styles.achievement}>
            <span style={styles.achievementIcon}>🔥</span>
            <span style={styles.achievementLabel}>7 Day Streak</span>
          </div>
          <div style={styles.achievement}>
            <span style={styles.achievementIcon}>⭐</span>
            <span style={styles.achievementLabel}>Perfect Sleep</span>
          </div>
          <div style={{ ...styles.achievement, ...styles.lockedAchievement }}>
            <span style={styles.achievementIcon}>🌙</span>
            <span style={styles.achievementLabel}>Night Owl</span>
          </div>
        </div>
      </div>

      <div style={styles.menuCard}>
        {menuItems.map((item, index) => (
          <div 
            key={item.label} 
            style={{
              ...styles.menuItem,
              ...(index === menuItems.length - 1 ? { border: 'none' } : {}),
            }}
          >
            <div style={styles.menuItemLeft}>
              <item.icon 
                size={22} 
                color={item.danger ? '#FF6B6B' : '#2D3436'} 
              />
              <span style={{
                ...styles.menuItemLabel,
                ...(item.danger ? { color: '#FF6B6B' } : {}),
              }}>
                {item.label}
              </span>
            </div>
            {item.toggle ? (
              <label style={styles.toggleSwitch}>
                <input
                  type="checkbox"
                  checked={item.value}
                  onChange={(e) => item.onChange(e.target.checked)}
                  style={styles.toggleInput}
                />
                <span style={{
                  ...styles.toggleSlider,
                  ...(item.value ? styles.toggleSliderActive : {}),
                }} />
              </label>
            ) : (
              <ChevronRight size={20} color="#B0B0B0" />
            )}
          </div>
        ))}
      </div>

      <p style={styles.version}>Sleep Compete v1.0.0</p>
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
  editButton: {
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
  profileCard: {
    background: 'white',
    borderRadius: '24px',
    padding: '30px',
    margin: '0 20px 20px',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  },
  avatarWrapper: {
    position: 'relative',
    display: 'inline-block',
  },
  avatarLarge: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: '#F5D799',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '50px',
    margin: '0 auto 16px',
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: '16px',
    right: '0',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    background: '#FF6B6B',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'white',
  },
  userName: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: '4px',
  },
  userHandle: {
    fontSize: '14px',
    color: '#636E72',
    marginBottom: '8px',
  },
  streakLarge: {
    fontSize: '16px',
    color: '#FF6B6B',
    fontWeight: '500',
    marginBottom: '24px',
  },
  statsRow: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileStat: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '0 20px',
  },
  profileStatValue: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#2D3436',
  },
  profileStatLabel: {
    fontSize: '12px',
    color: '#636E72',
  },
  statDivider: {
    width: '1px',
    height: '40px',
    background: '#E0E0E0',
  },
  achievementsCard: {
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
    marginBottom: '16px',
  },
  achievementsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '10px',
  },
  achievement: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '12px 8px',
    background: '#FFF9E6',
    borderRadius: '16px',
  },
  lockedAchievement: {
    background: '#F5F5F5',
    opacity: 0.6,
  },
  achievementIcon: {
    fontSize: '28px',
    marginBottom: '6px',
  },
  achievementLabel: {
    fontSize: '10px',
    color: '#636E72',
    textAlign: 'center',
  },
  menuCard: {
    background: 'white',
    borderRadius: '24px',
    margin: '0 20px 20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '16px 20px',
    borderBottom: '1px solid #F0F0F0',
    cursor: 'pointer',
  },
  menuItemLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  menuItemLabel: {
    fontSize: '15px',
    fontWeight: '500',
    color: '#2D3436',
  },
  toggleSwitch: {
    position: 'relative',
    width: '50px',
    height: '28px',
  },
  toggleInput: {
    opacity: 0,
    width: 0,
    height: 0,
  },
  toggleSlider: {
    position: 'absolute',
    cursor: 'pointer',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: '#E0E0E0',
    borderRadius: '28px',
    transition: '0.3s',
  },
  toggleSliderActive: {
    background: '#FF6B6B',
  },
  version: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#B0B0B0',
    marginTop: '10px',
  },
};

export default ProfilePage;
