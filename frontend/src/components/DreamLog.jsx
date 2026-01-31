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
    padding: '20px 0',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: '16px',
    paddingLeft: '20px',
  },
  scrollContainer: {
    display: 'flex',
    gap: '12px',
    overflowX: 'auto',
    paddingLeft: '20px',
    paddingRight: '20px',
    paddingBottom: '10px',
  },
  logIcon: {
    minWidth: '60px',
    height: '120px',
    background: '#F5D799',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logText: {
    writingMode: 'vertical-rl',
    textOrientation: 'mixed',
    transform: 'rotate(180deg)',
    fontWeight: '600',
    color: '#2D3436',
    fontSize: '16px',
  },
  dreamCard: {
    minWidth: '180px',
    maxWidth: '180px',
    background: 'white',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
    flexShrink: 0,
  },
  dreamAuthor: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#2D3436',
    display: 'block',
    marginBottom: '8px',
  },
  dreamContent: {
    fontSize: '13px',
    color: '#636E72',
    lineHeight: '1.4',
    overflow: 'hidden',
    display: '-webkit-box',
    WebkitLineClamp: 4,
    WebkitBoxOrient: 'vertical',
  },
};

export default DreamLog;
