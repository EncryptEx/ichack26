// Mock data for the sleep tracking app

export const currentUser = {
  id: 'user1',
  name: 'Alex',
  avatar: '😴',
  streak: 16
};

export const friends = [
  { id: 'user2', name: 'Vivienne', avatar: '👩', streak: 4 },
  { id: 'user3', name: 'Jaume', avatar: '👨', streak: 2 },
  { id: 'user4', name: 'Sofia', avatar: '👧', streak: 8 },
  { id: 'user5', name: 'Marcus', avatar: '🧔', streak: 12 },
  { id: 'user6', name: 'Emma', avatar: '👱‍♀️', streak: 6 },
  { id: 'user7', name: 'Lucas', avatar: '👦', streak: 3 },
  { id: 'user8', name: 'Mia', avatar: '👩‍🦰', streak: 9 },
];

export const generateSleepData = (userId, date) => {
  // Generate consistent random data based on userId and date
  const seed = userId.charCodeAt(4) + date.getDate() + date.getMonth();
  const sleepHours = 5 + (seed % 5) + (Math.random() * 2);
  const sleepQuality = 40 + (seed % 50) + Math.floor(Math.random() * 10);
  const points = Math.floor(sleepHours * 10 + sleepQuality * 0.5);
  // Determine if points went up or down (based on seed for consistency)
  const pointsChange = (seed % 3 === 0) ? 'down' : 'up';
  
  // Randomize times slightly based on seed
  const bedHour = (22 + (seed % 3)) % 24;
  const bedMin = (seed * 7) % 60;
  const wakeHour = 6 + (seed % 3); 
  const wakeMin = (seed * 11) % 60;

  const pad = (n) => n.toString().padStart(2, '0');
  const bedTime = `${pad(bedHour)}:${pad(bedMin)}`;
  const wakeTime = `${pad(wakeHour)}:${pad(wakeMin)}`;
  
  return {
    userId,
    date: date.toISOString(),
    sleepHours: parseFloat(sleepHours.toFixed(1)),
    sleepQuality: Math.min(100, sleepQuality),
    points,
    pointsChange,
    bedTime,
    wakeTime,
    deepSleep: parseFloat((sleepHours * 0.2).toFixed(1)),
    remSleep: parseFloat((sleepHours * 0.25).toFixed(1)),
    lightSleep: parseFloat((sleepHours * 0.55).toFixed(1)),
  };
};

export const dreams = [
  { id: 1, userId: 'user3', userName: 'Jaume', content: 'Somehsdkjhfkjdsf jdshfkhkjhdskjf djfdd.', date: '2026-01-27' },
  { id: 2, userId: 'user3', userName: 'Jaume', content: 'Somehsdkjhfkjdsf jdshfkhkjhdskjf djfdd.', date: '2026-01-27' },
  { id: 3, userId: 'user2', userName: 'Vivienne', content: 'I dreamt I was flying over mountains made of clouds. It felt so peaceful and free!', date: '2026-01-27' },
  { id: 4, userId: 'user1', userName: 'Alex', content: 'Had a weird dream about coding in my sleep. Even my subconscious wants to ship features.', date: '2026-01-26' },
  { id: 5, userId: 'user4', userName: 'Sofia', content: 'Dreamt I won the sleep competition! Maybe a premonition?', date: '2026-01-27' },
];

export const comments = [
  { id: 1, sleepRecordId: 'user1-2026-01-27', userId: 'user2', userName: 'Vivienne', content: 'Great sleep! Keep it up! 💪', timestamp: '2026-01-27T08:30:00' },
  { id: 2, sleepRecordId: 'user1-2026-01-27', userId: 'user3', userName: 'Jaume', content: 'How do you maintain such a streak?', timestamp: '2026-01-27T09:15:00' },
];

export const weeklyStats = {
  avgSleepHours: 7.8,
  avgQuality: 72,
  totalPoints: 856,
  bestDay: 'Tuesday',
  consistency: 85,
};

export const getAllUsers = () => [currentUser, ...friends];

export const getUserById = (id) => getAllUsers().find(u => u.id === id);
