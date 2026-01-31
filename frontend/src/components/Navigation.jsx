import { NavLink, useLocation } from 'react-router-dom';
import { Home, Target, BarChart3, Trophy, User } from 'lucide-react';

const Navigation = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/analytics', icon: Target, label: 'Goals' },
    { path: '/leaderboard', icon: Trophy, label: 'Rank' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav style={styles.nav}>
      {navItems.map(({ path, icon: Icon, label }) => (
        <NavLink
          key={path}
          to={path}
          style={{
            ...styles.navItem,
            ...(isActive(path) ? styles.activeNavItem : {}),
          }}
        >
          <div style={{
            ...styles.iconWrapper,
            ...(isActive(path) ? styles.activeIconWrapper : {}),
          }}>
            <Icon size={24} strokeWidth={isActive(path) ? 2.5 : 2} />
          </div>
        </NavLink>
      ))}
    </nav>
  );
};

const styles = {
  nav: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '480px',
    background: 'white',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '10px 20px 16px',
    borderTopLeftRadius: '24px',
    borderTopRightRadius: '24px',
    boxShadow: '0 -2px 16px rgba(0, 0, 0, 0.06)',
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textDecoration: 'none',
    color: '#B0B0B0',
    transition: 'color 0.2s',
  },
  activeNavItem: {
    color: '#2D3436',
  },
  iconWrapper: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background 0.2s',
  },
  activeIconWrapper: {
    background: '#FFCA5F',
  },
};

export default Navigation;
