import { useState, useMemo } from 'react';
import Calendar from '../components/Calendar';
import SleepCard from '../components/SleepCard';
import DreamLog from '../components/DreamLog';
import { currentUser, friends, dreams, generateSleepData } from '../data/mockData';

const HomePage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Morning';
    if (hour < 18) return 'Afternoon';
    return 'Evening';
  }, []);

  const allUsers = [currentUser, ...friends];

  const sleepDataForDate = useMemo(() => {
    return allUsers.map(user => ({
      user,
      sleepData: generateSleepData(user.id, selectedDate)
    })).sort((a, b) => {
      // Current user always first
      if (a.user.id === currentUser.id) return -1;
      if (b.user.id === currentUser.id) return 1;
      return b.sleepData.points - a.sleepData.points;
    });
  }, [selectedDate]);

  const filteredDreams = useMemo(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return dreams.filter(d => d.date === dateStr || dreams.length < 3);
  }, [selectedDate]);

  // Separate current user from friends
  const currentUserData = sleepDataForDate.find(d => d.user.id === currentUser.id);
  const friendsData = sleepDataForDate.filter(d => d.user.id !== currentUser.id);

  return (
    <div style={styles.container}>
      {/* Yellow curved background element */}
      <div style={styles.yellowBackground}></div>
      
      <div style={styles.content}>
        <header style={styles.header}>
          <h1 style={styles.greeting}>{greeting}, {currentUser.name}</h1>
        </header>

        <Calendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />

        <section style={styles.sleepSection}>
          {/* Scrollable sleep cards container */}
          <div style={styles.sleepScrollContainer} className="sleep-scroll">
            {/* Current user card */}
            {currentUserData && (
              <SleepCard
                key={currentUserData.user.id}
                user={currentUserData.user}
                sleepData={currentUserData.sleepData}
                isCurrentUser={true}
                rank={1}
              />
            )}

            {friendsData.map(({ user, sleepData }, index) => (
              <SleepCard
                key={user.id}
                user={user}
                sleepData={sleepData}
                isCurrentUser={false}
                rank={index + 2}
                compact={true}
              />
            ))}
          </div>
        </section>

        <DreamLog dreams={filteredDreams.length > 0 ? filteredDreams : dreams.slice(0, 4)} />
      </div>
    </div>
  );
};

const styles = {
  container: {
    height: '100vh',
    maxHeight: '100vh',
    overflow: 'hidden',
    background: '#FBF5E7',
    position: 'relative',
  },
  yellowBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '280px',
    background: '#FFCA5F',
    borderBottomLeftRadius: '0',
    borderBottomRightRadius: '0',
    zIndex: 0,
  },
  content: {
    position: 'relative',
    zIndex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: '70px',
  },
  header: {
    padding: '24px 24px 8px',
    flexShrink: 0,
  },
  greeting: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#2D3436',
    fontStyle: 'italic',
    fontFamily: "'Lora', serif",
  },
  sleepSection: {
    padding: '8px 24px',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    overflow: 'hidden',
  },
  sleepScrollContainer: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingRight: '4px',
    borderRadius: '16px',
  },
};

export default HomePage;
