import { useState, useMemo } from 'react';
import Calendar from '../components/Calendar';
import SleepCard from '../components/SleepCard';
import DreamLog from '../components/DreamLog';
// Import initial data from your mock file
import { currentUser, friends, dreams as initialDreams, generateSleepData } from '../data/mockData';

const HomePage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Lifted State for Dreams
  const [currentDreams, setCurrentDreams] = useState(initialDreams);

  const handleAddDream = (text) => {
    const newDream = {
      id: Date.now().toString(),
      userId: currentUser.id,
      userName: 'You',
      content: text,
      date: new Date().toISOString().split('T')[0],
      isNew: true // Flag to style it differently
    };
    // Add to beginning of array
    setCurrentDreams([newDream, ...currentDreams]);
  };

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
      if (a.user.id === currentUser.id) return -1;
      if (b.user.id === currentUser.id) return 1;
      return b.sleepData.points - a.sleepData.points;
    });
  }, [selectedDate]);

  // Separate current user from friends
  const currentUserData = sleepDataForDate.find(d => d.user.id === currentUser.id);
  const friendsData = sleepDataForDate.filter(d => d.user.id !== currentUser.id);

  return (
    <div style={styles.container}>
      <div style={styles.yellowBackground}></div>
      <div style={styles.content}>
        <header style={styles.header}>
          <h1 style={styles.greeting}>{greeting}, {currentUser.name.split(' ')[0]}</h1>
        </header>

        <Calendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />

        <section style={styles.sleepSection}>
          <h2 style={styles.sectionTitle}>Last Night</h2>
          <div style={styles.sleepScrollContainer} className="sleep-scroll">
            {currentUserData && (
              <SleepCard
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

        {/* Pass props to DreamLog */}
        <DreamLog 
            dreams={currentDreams} 
            onAddDream={handleAddDream}
        />
      </div>
    </div>
  );
};

const styles = {
  container: { height: '100vh', maxHeight: '100vh', overflow: 'hidden', background: '#FFF9EE', position: 'relative' },
  yellowBackground: { position: 'absolute', top: 0, left: 0, right: 0, height: '280px', background: '#FFCA5F', zIndex: 0 },
  content: { position: 'relative', zIndex: 1, height: '100%', display: 'flex', flexDirection: 'column', paddingBottom: '0' },
  header: { padding: '32px 36px 8px', flexShrink: 0 },
  greeting: { fontSize: '32px', fontWeight: '700', color: '#2D3436', fontFamily: "'Lora', serif", margin: 0 },
  sleepSection: { padding: '8px 0', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' },
  sectionTitle: { fontSize: '22px', fontWeight: '700', color: '#2D3436', fontFamily: "'Lora', serif", marginBottom: '16px', paddingLeft: '36px' },
  sleepScrollContainer: { flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingLeft: '36px', paddingRight: '24px', marginRight: '8px' },
};

export default HomePage;