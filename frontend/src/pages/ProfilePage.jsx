import { useState } from 'react';
import { ArrowLeft, Edit2, Users, LogOut, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { currentUser, friends } from '../data/mockData';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);

  // Calculate Rank (mock logic)
  const rank = 2; // Hardcoded derived from mock

  const handleSave = () => {
    // Here implies mock update
    currentUser.name = name;
    setIsEditing(false);
  };

  const handleLogout = () => {
     navigate('/login');
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={() => navigate('/')} style={styles.backButton}>
          <ArrowLeft size={24} color="#2D3436" />
        </button>
        <h1 style={styles.title}>Profile</h1>
        <div style={{width: 24}}></div>
      </header>

      <div style={styles.content}>
        
        {/* Avatar Section */}
        <div style={styles.avatarSection}>
          <div style={styles.avatarLarge}>{currentUser.avatar || '😴'}</div>
          {isEditing ? (
             <input 
                value={name} 
                onChange={(e) => setName(e.target.value)}
                style={styles.nameInput}
                autoFocus
             />
          ) : (
             <h2 style={styles.userName}>{name}</h2>
          )}
          <p style={styles.userHandle}>@{name.toLowerCase().replace(/\s/g, '')}</p>
        </div>

        {/* Stats Row */}
        <div style={styles.statsCard}>
            <div style={styles.statItem}>
                <span style={styles.statValue}>{currentUser.streak}</span>
                <span style={styles.statLabel}>Day Streak</span>
            </div>
            <div style={styles.divider}></div>
            <div style={styles.statItem}>
                <span style={styles.statValue}>{friends.length}</span>
                <span style={styles.statLabel}>Friends</span>
            </div>
            <div style={styles.divider}></div>
            <div style={styles.statItem}>
                <span style={styles.statValue}>#{rank}</span>
                <span style={styles.statLabel}>Global Rank</span>
            </div>
        </div>

        {/* Actions */}
        <div style={styles.actionList}>
            <button style={styles.actionButton}>
                <div style={styles.actionIconBg}><Users size={20} color="#2D3436" /></div>
                <span style={styles.actionText}>Manage Friends</span>
            </button>
            
            <button style={styles.actionButton} onClick={handleLogout}>
                <div style={{...styles.actionIconBg, background: '#FFE5E5'}}>
                    <LogOut size={20} color="#FF6B6B" />
                </div>
                <span style={{...styles.actionText, color: '#FF6B6B'}}>Log Out</span>
            </button>
        </div>

        {/* Edit Button (Bottom or Inline?) User asked for "Edit button that works" */}
        <div style={{ marginTop: 'auto' }}>
            {isEditing ? (
                <div style={styles.editActions}>
                     <button style={styles.cancelButton} onClick={() => setIsEditing(false)}>Cancel</button>
                     <button style={styles.saveButton} onClick={handleSave}>Save Changes</button>
                </div>
            ) : (
                <button style={styles.floatingEditButton} onClick={() => setIsEditing(true)}>
                    <Edit2 size={20} color="white" style={{marginRight: 10}} />
                    Edit Profile
                </button>
            )}
        </div>

      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#FFF9EE',
    color: '#2D3436',
    display: 'flex',
    flexDirection: 'column',
    fontFamily: "'Inter', sans-serif",
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 24px',
  },
  backButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: 0
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    fontFamily: "'Lora', serif",
  },
  content: {
    flex: 1,
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  
  avatarSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: '32px',
  },
  avatarLarge: {
    width: '100px',
    height: '100px',
    borderRadius: '50%',
    background: 'white',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '50px',
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    marginBottom: '16px',
    border: '4px solid white'
  },
  userName: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: '4px',
    fontFamily: "'Lora', serif",
  },
  nameInput: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#2D3436',
      marginBottom: '4px',
      fontFamily: "'Lora', serif",
      border: 'none',
      borderBottom: '2px solid #2D3436',
      background: 'transparent',
      textAlign: 'center',
      outline: 'none',
      width: '200px'
  },
  userHandle: {
    fontSize: '14px',
    color: '#B2BEC3',
    fontWeight: '500',
  },

  statsCard: {
    width: '100%',
    background: 'white',
    borderRadius: '24px',
    padding: '20px 0',
    display: 'flex',
    justifyContent: 'space-evenly',
    alignItems: 'center',
    boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
    marginBottom: '40px'
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px'
  },
  statValue: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#2D3436'
  },
  statLabel: {
    fontSize: '11px',
    color: '#B2BEC3',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  divider: {
    width: '1px',
    height: '32px',
    background: '#F0F0F0'
  },

  actionList: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    marginBottom: 'auto'
  },
  actionButton: {
    width: '100%',
    background: 'white',
    borderRadius: '20px',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    border: 'none',
    boxShadow: '0 4px 10px rgba(0,0,0,0.03)',
    cursor: 'pointer',
    transition: 'transform 0.1s'
  },
  actionIconBg: {
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    background: '#F5F6FA',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '16px'
  },
  actionText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2D3436'
  },

  // Edit Button Styles
  floatingEditButton: {
      background: '#2D3436',
      color: 'white',
      border: 'none',
      borderRadius: '32px',
      padding: '16px 32px',
      fontSize: '16px',
      fontWeight: '600',
      display: 'flex',
      alignItems: 'center',
      boxShadow: '0 8px 24px rgba(45, 52, 54, 0.3)',
      cursor: 'pointer',
      marginTop: '20px',
      marginBottom: '20px'
  },
  editActions: {
      display: 'flex',
      gap: '12px',
      marginTop: '20px',
      marginBottom: '20px'
  },
  saveButton: {
      background: '#2D3436',
      color: 'white',
      border: 'none',
      borderRadius: '32px',
      padding: '16px 32px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer'
  },
  cancelButton: {
      background: '#F5F6FA',
      color: '#2D3436',
      border: 'none',
      borderRadius: '32px',
      padding: '16px 24px',
      fontSize: '16px',
      fontWeight: '600',
      cursor: 'pointer'
  }
};

export default ProfilePage;
