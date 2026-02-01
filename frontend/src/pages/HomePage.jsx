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
          <h1 style={styles.greeting}>{greeting}, {currentUser.name.split(' ')[0]}</h1>
        </header>

        <Calendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />

        <section style={styles.sleepSection}>
          <h2 style={styles.sectionTitle}>Last Night</h2>
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
    background: '#FFF9EE',
    position: 'relative',
  },
  yellowBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '320px',
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
    padding: '40px 36px 12px',
    flexShrink: 0,
  },
  greeting: {
    fontSize: '42px',
    fontWeight: '700',
    color: '#2D3436',
    fontFamily: "'Lora', serif",
    margin: 0,
  },
  sleepSection: {
    padding: '8px 0',
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#2D3436',
    fontFamily: "'Lora', serif",
    marginBottom: '16px',
    paddingLeft: '36px',
  },
  sleepScrollContainer: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    paddingLeft: '36px',
    paddingRight: '24px',
    marginRight: '8px',
  },
};

export default HomePage;
