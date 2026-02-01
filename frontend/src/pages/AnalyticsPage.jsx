// src/pages/AnalyticsPage.jsx
import { useState, useMemo } from 'react';
import { Activity, Brain, Plus } from 'lucide-react';
import Calendar from '../components/Calendar';
import { currentUser, generateSleepData } from '../data/mockData';

const formatDuration = (hours) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m} min`;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} h`;
};

const AnalyticsPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [timeRange, setTimeRange] = useState('Today'); // 'Today', '1 Week', '1 Month'

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [overrides, setOverrides] = useState({});
  const [editForm, setEditForm] = useState({ bedTime: '', wakeTime: '' });

  // 1. Get stats for Selected Date (Top Section)
  const baseData = useMemo(() => generateSleepData(currentUser.id, selectedDate), [selectedDate]);
  
  // Apply overrides
  const dailyData = useMemo(() => {
     const key = selectedDate.toDateString();
     return overrides[key] ? { ...baseData, ...overrides[key] } : baseData;
  }, [baseData, overrides, selectedDate]);

  const handleEditClick = () => {
      if (!isEditing) {
          setEditForm({ bedTime: dailyData.bedTime, wakeTime: dailyData.wakeTime });
          setIsEditing(true);
      } else {
          // Save
          setOverrides(prev => ({
              ...prev,
              [selectedDate.toDateString()]: { bedTime: editForm.bedTime, wakeTime: editForm.wakeTime }
          }));
          setIsEditing(false);
      }
  };

  // 2. Wrap dailyData into sleepStats structure but calculating breakdown based on TimeRange
  const { breakdown, currentGraph } = useMemo(() => {
     let dataList = [];
     let labels = [];
     let bars = [];

     // Helper for bar color
     const getBarColor = (val) => val > 7 ? '#97AF68' : (val > 5 ? '#EA8323' : '#7E7E7E');

     if (timeRange === 'Today') {
        dataList = [dailyData];
        // Mock hourly bars for visual effect
        labels = [dailyData.bedTime + ' p.m.', dailyData.wakeTime + ' a.m.'];
        bars = Array(21).fill(0).map(() => {
           const h = Math.random() * 80;
           return { h, color: h > 50 ? '#97AF68' : '#EA8323' };
        });
     } else {
        const days = timeRange === '1 Week' ? 7 : 30;
        labels = timeRange === '1 Week' ? ['Mon', 'Sun'] : ['1st', '30th'];
        
        // Generate history
        for (let i = days - 1; i >= 0; i--) {
            const d = new Date(selectedDate);
            d.setDate(d.getDate() - i);
            const dayStats = generateSleepData(currentUser.id, d);
            dataList.push(dayStats);
            bars.push({
                h: Math.min((dayStats.sleepHours / 10) * 100, 100),
                color: getBarColor(dayStats.sleepHours)
            });
        }
     }

     // Calculate Average Breakdown
     const avgDeep = dataList.reduce((acc, d) => acc + d.deepSleep, 0) / dataList.length;
     const avgLight = dataList.reduce((acc, d) => acc + d.lightSleep + d.remSleep, 0) / dataList.length; 
     const avgAwake = dataList.reduce((acc, d) => acc + (d.sleepHours * 0.15), 0) / dataList.length; // Mock ~15% awake
     
     const total = avgDeep + avgLight + avgAwake;

     return {
         currentGraph: { labels, bars },
         breakdown: {
            awake: { time: formatDuration(avgAwake), percent: avgAwake/total, color: '#7E7E7E' },
            light: { time: formatDuration(avgLight), percent: avgLight/total, color: '#97AF68' },
            deep: { time: formatDuration(avgDeep), percent: avgDeep/total, color: '#EA8323' }
         }
     };
  }, [selectedDate, timeRange, dailyData]);

  const sleepStats = {
    total: dailyData.sleepHours,
    fallAsleep: dailyData.bedTime + (parseInt(dailyData.bedTime.split(':')[0]) >= 12 ? ' PM' : ' AM'),
    wakeUp: dailyData.wakeTime + ' AM',
    quality: dailyData.sleepQuality,
    breakdown
  };

  return (
    <div style={styles.container}>
      {/* Yellow Header */}
      <div style={styles.topSection}>
        <div style={styles.calendarWrapper}>
          <Calendar selectedDate={selectedDate} onDateSelect={setSelectedDate} />
        </div>
      </div>

      {/* "You Slept for" Card - Merging into background */}
      <div style={styles.sleptForCard}>
        <h2 style={styles.sleptForTitle}>You Slept for</h2>
        <div style={styles.sleptForValue}>
          {sleepStats.total}<span style={styles.sleptForUnit}>h</span>
        </div>
      </div>

      <div style={styles.content}>
        {/* Stats Row */}
        <div style={styles.statsRow}>
          {/* Times Card */}
          <div style={styles.timesCard}>
            <div style={styles.timesHeaderRow}>
              <div style={styles.timeBlock}>
                <span style={styles.timeLabel}>FALL ASLEEP</span>
                {isEditing ? (
                    <input 
                        type="time" 
                        value={editForm.bedTime}
                        onChange={(e) => setEditForm({...editForm, bedTime: e.target.value})}
                        style={styles.timeInput}
                    />
                ) : (
                    <span style={styles.timeValue}>{sleepStats.fallAsleep}</span>
                )}
              </div>
              <div style={styles.timeBlock}>
                <span style={styles.timeLabel}>WAKE UP</span>
                {isEditing ? (
                    <input 
                        type="time" 
                        value={editForm.wakeTime}
                        onChange={(e) => setEditForm({...editForm, wakeTime: e.target.value})}
                        style={styles.timeInput}
                    />
                ) : (
                    <span style={styles.timeValue}>{sleepStats.wakeUp}</span>
                )}
              </div>
            </div>
            <button 
                style={{...styles.editButton, background: isEditing ? '#97AF68' : '#262626'}} 
                onClick={handleEditClick}
            >
                {isEditing ? 'Save Data' : 'Edit data'}
            </button>
          </div>

          {/* Quality Card */}
          <div style={styles.qualityCard}>
            <span style={styles.qualityLabel}>Sleep Quality</span>
            <div style={styles.qualityValueContainer}>
              <span style={styles.qualityNumber}>{sleepStats.quality}</span>
              <span style={styles.qualityPercent}>%</span>
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 style={styles.sectionTitle}>Sleep Insights</h3>

        {/* Insights Ring Chart Card */}
        <div style={styles.insightsCard}>
          <div style={styles.chartContainer}>
            <RingChart stats={sleepStats.breakdown} />
          </div>

          <div style={styles.legendRow}>
            <LegendItem label="AWAKE" time={sleepStats.breakdown.awake.time} color="#9BB16A" icon={Activity} />
            <LegendItem label="LIGHT" time={sleepStats.breakdown.light.time} color="#EA8323" icon={Brain} />
            <LegendItem label="DEEP" time={sleepStats.breakdown.deep.time} color="#737373" icon={Plus} />
          </div>
        </div>

        {/* Toggle Pills */}
        <div style={styles.toggleContainer}>
          {['Today', '1 Week', '1 Month'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={timeRange === range ? styles.toggleActive : styles.toggleInactive}
            >
              {range}
            </button>
          ))}
        </div>

        {/* Interactive History Graph */}
        <div style={styles.historyCard}>
          <div style={styles.barsContainer}>
            {currentGraph.bars.map((bar, i) => (
              <div 
                key={i} 
                style={{
                  ...styles.bar,
                  height: `${bar.h}%`,
                  backgroundColor: bar.color,
                  width: timeRange === '1 Week' ? '24px' : (timeRange === '1 Month' ? '12px' : '8px') // Adjust bar width based on count
                }} 
              />
            ))}
          </div>
          <div style={styles.historyLabels}>
            <span>{currentGraph.labels[0]}</span>
            <span>{currentGraph.labels[1]}</span>
          </div>
        </div>

      </div>
    </div>
  );
};

// Helper Component for Legend
const LegendItem = ({ label, time, color, icon: Icon }) => (
  <div style={styles.legendItem}>
    <span style={styles.legendTitle}>{label}</span>
    <span style={styles.legendTime}>{time}</span>
    <div style={{...styles.legendIconCircle, background: color}}>
       <Icon size={20} color="white" />
    </div>
  </div>
);

// Ring Chart (Unchanged visual)
const RingChart = ({ stats }) => {
  const size = 260;
  const center = size / 2;
  const strokeWidth = 32;
  
  const rings = [
    { r: 100, color: stats.awake.color, percent: stats.awake.percent, bg: '#DCDCDC', icon: <Activity size={16} color={stats.awake.color} /> },
    { r: 65, color: stats.light.color, percent: stats.light.percent, bg: '#EBEBEB', icon: <Brain size={16} color={stats.light.color} /> },
    { r: 30, color: stats.deep.color, percent: stats.deep.percent, bg: '#F5F5F5', icon: <Plus size={16} color={stats.deep.color} /> }
  ];

  const getCoordinates = (radius, percent) => {
    const degrees = (percent * 360) - 90;
    const radians = degrees * (Math.PI / 180);
    return {
      x: center + radius * Math.cos(radians),
      y: center + radius * Math.sin(radians)
    };
  };

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {rings.map((ring, i) => {
          const circumference = 2 * Math.PI * ring.r;
          return (
            <g key={i}>
              <circle cx={center} cy={center} r={ring.r} fill="none" stroke={ring.bg} strokeWidth={strokeWidth} />
              <circle 
                cx={center} cy={center} r={ring.r} fill="none" stroke={ring.color} strokeWidth={strokeWidth}
                strokeLinecap="round" strokeDasharray={`${circumference * ring.percent} ${circumference}`}
                transform={`rotate(-90 ${center} ${center})`}
              />
            </g>
          );
        })}
      </svg>
      {rings.map((ring, i) => {
        const { x, y } = getCoordinates(ring.r, ring.percent);
        return (
          <div key={`icon-${i}`} style={{
            position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)',
            width: '24px', height: '24px', background: 'white', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 10
          }}>
            {ring.icon}
          </div>
        );
      })}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#FFF9EE', // Main Beige Background
    position: 'relative',
    fontFamily: "'Inter', sans-serif",
    paddingBottom: '90px',
  },
  topSection: {
    background: '#FFCA5F',
    paddingBottom: '80px', // Extra padding to allow the beige card to cut in
    borderBottomLeftRadius: '0',
    borderBottomRightRadius: '0',
  },
  calendarWrapper: {
    paddingTop: '10px',
  },
  // The trick for "merging": Same background color as body, negative margin to pull it up
  sleptForCard: {
    background: '#FFF9EE', // Matches body background exactly
    marginTop: '-50px', // Pulls it up into the yellow section
    marginLeft: '20px',
    marginRight: '20px',
    borderRadius: '40px', // Large radius
    padding: '30px 24px',
    textAlign: 'center',
    position: 'relative',
    zIndex: 10, // Sits on top
    // No shadow to ensure the "merged" look
  },
  sleptForTitle: {
    fontSize: '26px',
    fontWeight: '700',
    color: '#4A3B32',
    marginBottom: '8px',
    fontFamily: "'Lora', serif",
  },
  sleptForValue: {
    fontSize: '72px',
    fontWeight: '800',
    color: '#3D2E28',
    lineHeight: '1',
  },
  sleptForUnit: {
    fontSize: '36px',
    color: '#C7C7C7',
    marginLeft: '6px',
    fontWeight: '500',
  },
  content: {
    padding: '10px 20px 20px',
  },
  statsRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '32px',
  },
  timesCard: {
    flex: '1.4',
    background: '#FFCA5F',
    borderRadius: '32px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  timesHeaderRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '20px',
    gap: '8px',
  },
  timeBlock: {
    display: 'flex',
    flexDirection: 'column',
  },
  timeLabel: {
    fontSize: '11px',
    fontWeight: '800',
    color: '#8A7A5A',
    marginBottom: '6px',
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  timeValue: {
    fontSize: '18px',
    fontWeight: '900',
    color: '#1A1A1A',
  },
  timeInput: {
      fontSize: '16px',
      fontWeight: '700',
      color: '#1A1A1A',
      background: 'white',
      border: 'none',
      borderRadius: '8px',
      padding: '4px',
      width: '100px'
  },
  editButton: {
    background: '#262626',
    color: 'white',
    border: 'none',
    borderRadius: '24px',
    padding: '12px 0',
    fontSize: '13px',
    fontWeight: '600',
    width: '110px',
    alignSelf: 'center',
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
  },
  qualityCard: {
    flex: '1',
    background: '#FFCA5F',
    borderRadius: '32px',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  qualityLabel: {
    fontSize: '13px',
    fontWeight: '700',
    color: '#8A7A5A',
    marginBottom: '4px',
    opacity: 0.9,
  },
  qualityValueContainer: {
    display: 'flex',
    alignItems: 'baseline',
  },
  qualityNumber: {
    fontSize: '56px',
    fontWeight: '900',
    color: '#1A1A1A',
    lineHeight: '1',
  },
  qualityPercent: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#1A1A1A',
  },
  sectionTitle: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#3D2E28',
    fontFamily: "'Lora', serif",
    marginBottom: '24px',
  },
  insightsCard: {
    background: '#F8F6F2',
    borderRadius: '40px',
    padding: '40px 10px',
    marginBottom: '32px',
  },
  chartContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '40px',
  },
  legendRow: {
    display: 'flex',
    justifyContent: 'space-evenly',
    padding: '0 10px',
  },
  legendItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  legendTitle: {
    fontSize: '12px',
    fontWeight: '800',
    color: '#9CA3AF',
    marginBottom: '6px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  legendTime: {
    fontSize: '20px',
    fontWeight: '800',
    color: '#1A1A1A',
    marginBottom: '16px',
  },
  legendIconCircle: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
  },
  toggleContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '8px',
    marginBottom: '32px',
    alignItems: 'center',
  },
  toggleActive: {
    background: '#97AF68',
    color: 'white',
    // Semi-transparent border effect using box-shadow or border
    border: '4px solid rgba(151, 175, 104, 0.4)', 
    borderRadius: '24px',
    padding: '10px 28px',
    fontSize: '15px',
    fontWeight: '700',
    cursor: 'pointer',
    backgroundClip: 'padding-box', // Keeps bg inside border
    transition: 'all 0.2s ease',
  },
  toggleInactive: {
    background: 'white',
    color: '#4B5563',
    border: 'none',
    borderRadius: '24px',
    padding: '14px 28px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
    transition: 'all 0.2s ease',
  },
  historyCard: {
    background: '#FFCA5F',
    borderRadius: '36px',
    padding: '36px 32px', // More margin inside
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  barsContainer: {
    height: '140px',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: '6px',
  },
  bar: {
    borderRadius: '8px', // Nicer rounded tips
    transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)', // Bouncy transition
  },
  historyLabels: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    fontWeight: '700',
    color: '#4A3B32',
    marginTop: '8px',
  },
};

export default AnalyticsPage;