// src/components/Navigation.jsx
import { NavLink } from 'react-router-dom';
import { Home, Target, Trophy, User } from 'lucide-react';

const Navigation = () => {
  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/analytics', icon: Target, label: 'Goals' },
    { path: '/leaderboard', icon: Trophy, label: 'Rank' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <nav style={styles.navContainer}>
      <div style={styles.navBar}>
        {navItems.map(({ path, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            style={({ isActive }) => ({
              ...styles.navItem,
              ...(isActive ? styles.activeNavItem : {}),
            })}
          >
            {({ isActive }) => (
              <>
                <div style={{
                  ...styles.iconWrapper,
                  ...(isActive ? styles.activeIconWrapper : {}),
                }}>
                  <Icon 
                    size={24} 
                    color={isActive ? '#2D3436' : '#B0B0B0'} 
                    strokeWidth={isActive ? 2.5 : 2} 
                  />
                </div>
                {isActive && <div style={styles.activeDot} />}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

const styles = {
  navContainer: {
    position: 'fixed',
    bottom: '24px', // Floating effect
    left: '50%',
    transform: 'translateX(-50%)',
    width: 'calc(100% - 40px)', // Responsive width with margins
    maxWidth: '440px',
    zIndex: 1000, // ENSURES CLICKS WORK
  },
  navBar: {
    background: 'rgba(255, 255, 255, 0.95)', // Slight transparency
    backdropFilter: 'blur(10px)', // Glass effect
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 24px',
    borderRadius: '32px',
    boxShadow: '0 10px 40px -10px rgba(88, 54, 15, 0.15)', // Softer, nicer shadow
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textDecoration: 'none',
    position: 'relative',
    transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
  activeNavItem: {
    transform: 'translateY(-4px)',
  },
  iconWrapper: {
    width: '48px',
    height: '48px',
    borderRadius: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.3s ease',
  },
  activeIconWrapper: {
    background: '#FFCA5F',
    boxShadow: '0 4px 12px rgba(255, 202, 95, 0.4)',
  },
  activeDot: {
    position: 'absolute',
    bottom: '-8px',
    width: '4px',
    height: '4px',
    background: '#2D3436',
    borderRadius: '50%',
  }
};

export default Navigation;