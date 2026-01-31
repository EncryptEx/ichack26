import { useRef, useState } from 'react';

const Calendar = ({ selectedDate, onDateSelect }) => {
  const scrollRef = useRef(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const monday = new Date(today);
    monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
    return monday;
  });

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const getWeekDates = () => {
    const dates = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(currentWeekStart);
      date.setDate(currentWeekStart.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const weekDates = getWeekDates();

  const isSelected = (date) => {
    return date.toDateString() === selectedDate.toDateString();
  };

  const isToday = (date) => {
    return date.toDateString() === new Date().toDateString();
  };

  const handlePrevWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newStart);
  };

  const handleNextWeek = () => {
    const newStart = new Date(currentWeekStart);
    newStart.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newStart);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button onClick={handlePrevWeek} style={styles.navButton}>‹</button>
        <div style={styles.daysRow}>
          {days.map((day, index) => (
            <span key={day} style={{
              ...styles.dayLabel,
              fontWeight: isSelected(weekDates[index]) ? '600' : '400'
            }}>
              {day}
            </span>
          ))}
        </div>
        <button onClick={handleNextWeek} style={styles.navButton}>›</button>
      </div>
      
      <div style={styles.datesRow} ref={scrollRef}>
        {weekDates.map((date) => (
          <button
            key={date.toISOString()}
            onClick={() => onDateSelect(date)}
            style={{
              ...styles.dateButton,
              ...(isSelected(date) ? styles.selectedDate : {}),
              ...(isToday(date) && !isSelected(date) ? styles.todayDate : {}),
            }}
          >
            {date.getDate()}
          </button>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '16px 10px 20px',
    flexShrink: 0,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
  },
  navButton: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    color: '#2D3436',
    padding: '2px 6px',
    opacity: 0.6,
  },
  daysRow: {
    display: 'flex',
    justifyContent: 'space-around',
    flex: 1,
  },
  dayLabel: {
    fontSize: '13px',
    color: '#2D3436',
    width: '42px',
    textAlign: 'center',
    fontFamily: "'Inter', sans-serif",
  },
  datesRow: {
    display: 'flex',
    justifyContent: 'space-around',
    paddingLeft: '28px',
    paddingRight: '28px',
  },
  dateButton: {
    width: '42px',
    height: '42px',
    borderRadius: '50%',
    border: 'none',
    background: 'white',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    color: '#2D3436',
    fontFamily: "'Inter', sans-serif",
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.08)',
  },
  selectedDate: {
    background: '#2D3436',
    color: 'white',
  },
  todayDate: {
    border: '2px solid #2D3436',
  },
};

export default Calendar;
