import { useRef } from 'react';

const DreamLog = ({ dreams }) => {
  const scrollRef = useRef(null);

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Dream Log</h2>
      <div style={styles.scrollContainer} ref={scrollRef} className="hide-scrollbar">
        <div style={styles.logIcon}>
          <span style={styles.logText}>Log</span>
        </div>
        {dreams.map((dream) => (
          <div key={dream.id} style={styles.dreamCard}>
            <span style={styles.dreamAuthor}>{dream.userName}</span>
            <p style={styles.dreamContent}>{dream.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: '12px 0 16px',
    flexShrink: 0,
    minHeight: '160px',
  },
  title: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: '12px',
    paddingLeft: '16px',
    fontFamily: "'Lora', serif",
  },
  scrollContainer: {
    display: 'flex',
    gap: '12px',
    overflowX: 'auto',
    overflowY: 'hidden',
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingBottom: '8px',
    scrollSnapType: 'x mandatory',
  },
  logIcon: {
    minWidth: '55px',
    height: '110px',
    background: '#FFCA5F',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    scrollSnapAlign: 'start',
  },
  logText: {
    writingMode: 'vertical-rl',
    textOrientation: 'mixed',
    transform: 'rotate(180deg)',
    fontWeight: '600',
    color: '#2D3436',
    fontSize: '15px',
  },
  dreamCard: {
    minWidth: '150px',
    maxWidth: '150px',
    height: '110px',
    background: 'white',
    borderRadius: '16px',
    padding: '14px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
    flexShrink: 0,
    scrollSnapAlign: 'start',
    overflow: 'hidden',
  },
  dreamAuthor: {
    fontSize: '13px',
    fontWeight: '600',
    color: '#2D3436',
    display: 'block',
    marginBottom: '6px',
  },
  dreamContent: {
    fontSize: '12px',
    color: '#636E72',
    lineHeight: '1.3',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 4,
    WebkitBoxOrient: 'vertical',
  },
};

export default DreamLog;
