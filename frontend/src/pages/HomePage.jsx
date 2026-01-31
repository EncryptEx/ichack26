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
    })).sort((a, b) => b.sleepData.points - a.sleepData.points);
  }, [selectedDate]);

  const filteredDreams = useMemo(() => {
    const dateStr = selectedDate.toISOString().split('T')[0];
    return dreams.filter(d => d.date === dateStr || dreams.length < 3);
  }, [selectedDate]);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.greeting}>{greeting}, {currentUser.name}</h1>
      </header>

      <Calendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />

      <section style={styles.sleepSection}>
        {sleepDataForDate.map(({ user, sleepData }, index) => (
          <SleepCard
            key={user.id}
            user={user}
            sleepData={sleepData}
            isCurrentUser={user.id === currentUser.id}
            rank={index + 1}
          />
        ))}
      </section>

      <DreamLog dreams={filteredDreams.length > 0 ? filteredDreams : dreams.slice(0, 4)} />
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #F5D799 0%, #FFF8E7 30%)',
  },
  header: {
    padding: '40px 20px 0',
  },
  greeting: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#2D3436',
    fontStyle: 'italic',
  },
  sleepSection: {
    padding: '20px',
  },
};

export default HomePage;
