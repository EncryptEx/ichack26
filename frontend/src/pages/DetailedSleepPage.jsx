import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Moon, Sun, Clock, Zap, MessageCircle, Send } from 'lucide-react';
import { getUserById, generateSleepData, comments as initialComments, currentUser } from '../data/mockData';

const DetailedSleepPage = () => {
  const { userId, date } = useParams();
  const navigate = useNavigate();
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState(initialComments);

  const user = getUserById(userId);
  const sleepDate = new Date(date);
  const sleepData = useMemo(() => generateSleepData(userId, sleepDate), [userId, date]);
  
  const isCurrentUser = userId === currentUser.id;
  const recordId = `${userId}-${date}`;
  const recordComments = comments.filter(c => c.sleepRecordId === recordId);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now(),
      sleepRecordId: recordId,
      userId: currentUser.id,
      userName: currentUser.name,
      content: newComment,
      timestamp: new Date().toISOString(),
    };
    
    setComments([...comments, comment]);
    setNewComment('');
  };

  const totalSleep = sleepData.sleepHours;
  const deepPercent = (sleepData.deepSleep / totalSleep) * 100;
  const remPercent = (sleepData.remSleep / totalSleep) * 100;
  const lightPercent = (sleepData.lightSleep / totalSleep) * 100;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <button onClick={() => navigate(-1)} style={styles.backButton}>
          <ArrowLeft size={24} />
        </button>
        <h1 style={styles.title}>
          {isCurrentUser ? 'Your Sleep' : `${user?.name}'s Sleep`}
        </h1>
        <div style={{ width: 40 }} />
      </header>

      <div style={styles.dateDisplay}>
        {sleepDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric' 
        })}
      </div>

      <div style={styles.scoreCard}>
        <div style={styles.pointsCircle}>
          <span style={styles.points}>+{sleepData.points}</span>
          <span style={styles.pointsLabel}>points</span>
        </div>
        <div style={styles.streakBadge}>
          🔥 {user?.streak} day streak
        </div>
      </div>

      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <Moon size={24} color="#6C5CE7" />
          <span style={styles.statValue}>{sleepData.bedTime}</span>
          <span style={styles.statLabel}>Bedtime</span>
        </div>
        <div style={styles.statCard}>
          <Sun size={24} color="#FDCB6E" />
          <span style={styles.statValue}>{sleepData.wakeTime}</span>
          <span style={styles.statLabel}>Wake up</span>
        </div>
        <div style={styles.statCard}>
          <Clock size={24} color="#00B894" />
          <span style={styles.statValue}>{sleepData.sleepHours}h</span>
          <span style={styles.statLabel}>Duration</span>
        </div>
        <div style={styles.statCard}>
          <Zap size={24} color="#E17055" />
          <span style={styles.statValue}>{sleepData.sleepQuality}%</span>
          <span style={styles.statLabel}>Quality</span>
        </div>
      </div>

      <div style={styles.sleepStagesCard}>
        <h3 style={styles.sectionTitle}>Sleep Stages</h3>
        <div style={styles.stagesBar}>
          <div style={{ ...styles.stageSegment, width: `${deepPercent}%`, background: '#6C5CE7' }} />
          <div style={{ ...styles.stageSegment, width: `${remPercent}%`, background: '#00B894' }} />
          <div style={{ ...styles.stageSegment, width: `${lightPercent}%`, background: '#74B9FF' }} />
        </div>
        <div style={styles.stagesLegend}>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendDot, background: '#6C5CE7' }} />
            <span>Deep ({sleepData.deepSleep}h)</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendDot, background: '#00B894' }} />
            <span>REM ({sleepData.remSleep}h)</span>
          </div>
          <div style={styles.legendItem}>
            <div style={{ ...styles.legendDot, background: '#74B9FF' }} />
            <span>Light ({sleepData.lightSleep}h)</span>
          </div>
        </div>
      </div>

      {!isCurrentUser && (
        <div style={styles.commentsSection}>
          <h3 style={styles.sectionTitle}>
            <MessageCircle size={20} style={{ marginRight: 8 }} />
            Comments
          </h3>
          
          <div style={styles.commentsList}>
            {recordComments.length === 0 ? (
              <p style={styles.noComments}>Be the first to comment!</p>
            ) : (
              recordComments.map(comment => (
                <div key={comment.id} style={styles.comment}>
                  <span style={styles.commentAuthor}>{comment.userName}</span>
                  <p style={styles.commentContent}>{comment.content}</p>
                </div>
              ))
            )}
          </div>

          <div style={styles.commentInput}>
            <input
              type="text"
              placeholder="Add a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
              style={styles.input}
            />
            <button onClick={handleAddComment} style={styles.sendButton}>
              <Send size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(180deg, #F5D799 0%, #FFF8E7 30%)',
    paddingBottom: '100px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '20px',
    paddingTop: '40px',
  },
  backButton: {
    background: 'white',
    border: 'none',
    borderRadius: '50%',
    width: '40px',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  title: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#2D3436',
  },
  dateDisplay: {
    textAlign: 'center',
    fontSize: '14px',
    color: '#636E72',
    marginBottom: '20px',
  },
  scoreCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
  },
  pointsCircle: {
    width: '120px',
    height: '120px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
    boxShadow: '0 8px 30px rgba(255, 107, 107, 0.3)',
  },
  points: {
    fontSize: '28px',
    fontWeight: '700',
    color: 'white',
  },
  pointsLabel: {
    fontSize: '12px',
    color: 'white',
    opacity: 0.9,
  },
  streakBadge: {
    background: 'white',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#FF6B6B',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '12px',
    padding: '20px',
  },
  statCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2D3436',
    marginTop: '8px',
  },
  statLabel: {
    fontSize: '12px',
    color: '#636E72',
    marginTop: '4px',
  },
  sleepStagesCard: {
    background: 'white',
    borderRadius: '20px',
    padding: '20px',
    margin: '0 20px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2D3436',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
  },
  stagesBar: {
    display: 'flex',
    height: '12px',
    borderRadius: '6px',
    overflow: 'hidden',
    marginBottom: '16px',
  },
  stageSegment: {
    height: '100%',
  },
  stagesLegend: {
    display: 'flex',
    justifyContent: 'space-around',
  },
  legendItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    fontSize: '12px',
    color: '#636E72',
  },
  legendDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
  },
  commentsSection: {
    padding: '20px',
    marginTop: '20px',
  },
  commentsList: {
    background: 'white',
    borderRadius: '20px',
    padding: '16px',
    marginBottom: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
  },
  noComments: {
    textAlign: 'center',
    color: '#636E72',
    fontSize: '14px',
  },
  comment: {
    padding: '12px 0',
    borderBottom: '1px solid #F0F0F0',
  },
  commentAuthor: {
    fontWeight: '600',
    fontSize: '14px',
    color: '#2D3436',
  },
  commentContent: {
    fontSize: '13px',
    color: '#636E72',
    marginTop: '4px',
  },
  commentInput: {
    display: 'flex',
    gap: '10px',
  },
  input: {
    flex: 1,
    padding: '14px 20px',
    borderRadius: '25px',
    border: 'none',
    background: 'white',
    fontSize: '14px',
    fontFamily: 'Poppins, sans-serif',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
    outline: 'none',
  },
  sendButton: {
    width: '50px',
    height: '50px',
    borderRadius: '50%',
    background: '#FF6B6B',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    color: 'white',
    boxShadow: '0 4px 15px rgba(255, 107, 107, 0.3)',
  },
};

export default DetailedSleepPage;
