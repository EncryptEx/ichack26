import { useState, useMemo, useEffect } from 'react';
import Calendar from '../components/Calendar';
import SleepCard from '../components/SleepCard';
import DreamLog from '../components/DreamLog';
// Import initial data from your mock file
import { currentUser, friends, generateSleepData } from '../data/mockData';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const HomePage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [streak, setStreak] = useState({ current_streak: 0, longest_streak: 0 });
  
  // Lifted State for Dreams - now fetched from API
  const [currentDreams, setCurrentDreams] = useState([]);
  const [dreamsLoading, setDreamsLoading] = useState(true);

  // Fetch streak data on mount
  useEffect(() => {
    const fetchStreak = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        
        const response = await fetch(`${API_URL}/api/analytics/streak`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          setStreak(data);
        }
      } catch (error) {
        console.error('Failed to fetch streak:', error);
      }
    };
    
    fetchStreak();
  }, []);

  // Fetch dreams from API (social feed)
  useEffect(() => {
    const fetchDreams = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setDreamsLoading(false);
          return;
        }
        
        const response = await fetch(`${API_URL}/api/dreams/feed`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          // Transform API response to match frontend format
          const transformedDreams = data.map(dream => ({
            id: dream.id,
            userId: dream.user_id,
            userName: dream.username, // From social feed endpoint
            content: dream.content,
            title: dream.title,
            mood: dream.mood,
            date: dream.date.split('T')[0],
            isNew: false
          }));
          setCurrentDreams(transformedDreams);
        }
      } catch (error) {
        console.error('Failed to fetch dreams:', error);
      } finally {
        setDreamsLoading(false);
      }
    };
    
    fetchDreams();
  }, []);

  const handleAddDream = async (text) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No auth token found');
      return;
    }

    // Create title from first line or first 50 chars
    const title = text.split('\n')[0].substring(0, 50) || 'Dream Entry';
    
    try {
      const response = await fetch(`${API_URL}/api/dreams/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: title,
          content: text,
          mood: null
        })
      });

      if (response.ok) {
        const newDreamFromApi = await response.json();
        // Transform and add to beginning of array
        const newDream = {
          id: newDreamFromApi.id,
          userId: newDreamFromApi.user_id,
          userName: 'You',
          content: newDreamFromApi.content,
          title: newDreamFromApi.title,
          mood: newDreamFromApi.mood,
          date: newDreamFromApi.date.split('T')[0],
          isNew: true
        };
        setCurrentDreams([newDream, ...currentDreams]);
      } else {
        console.error('Failed to save dream:', response.statusText);
      }
    } catch (error) {
      console.error('Failed to save dream:', error);
    }
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
          <div style={styles.headerRow}>
            <h1 style={styles.greeting}>{greeting}, {currentUser.name.split(' ')[0]}</h1>
            {streak.current_streak > 0 && (
              <div style={styles.streakBadge}>
                🔥 {streak.current_streak} day{streak.current_streak !== 1 ? 's' : ''}
              </div>
            )}
          </div>
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
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: '32px', fontWeight: '700', color: '#2D3436', fontFamily: "'Lora', serif", margin: 0 },
  streakBadge: { 
    background: '#FF6B6B', 
    color: 'white', 
    padding: '6px 12px', 
    borderRadius: '20px', 
    fontSize: '14px', 
    fontWeight: '600',
    boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)'
  },
  sleepSection: { padding: '8px 0', flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0, overflow: 'hidden' },
  sectionTitle: { fontSize: '22px', fontWeight: '700', color: '#2D3436', fontFamily: "'Lora', serif", marginBottom: '16px', paddingLeft: '24px' },
  sleepScrollContainer: { flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingLeft: '24px', paddingRight: '24px', marginRight: '8px' },
};

export default HomePage;