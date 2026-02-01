import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Activity, Brain, Plus, ChevronLeft, Moon, MessageCircle, Send } from 'lucide-react';
import { currentUser, friends, dreams } from '../data/mockData'; // Assuming you have this or use the mock below

const DetailedSleepPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [commentText, setCommentText] = useState('');
  
  // Find user (Mock logic)
  const allUsers = [currentUser, ...friends];
  const user = allUsers.find(u => u.id === userId) || currentUser;
  const isCurrentUser = user.id === currentUser.id;
  
  // Mock Data specific to this view
  const sleepStats = {
    total: 7.5,
    fallAsleep: '11:45 PM',
    wakeUp: '07:15 AM',
    quality: 72,
    breakdown: {
      awake: { time: '20 min', percent: 0.10, color: '#7E7E7E' },
      light: { time: '04:30 h', percent: 0.60, color: '#97AF68' },
      deep: { time: '02:40 h', percent: 0.30, color: '#EA8323' }
    }
  };

  // Check if this user had a dream logged for this "date"
  // For demo purposes, we just check if it's the friend "Alex" or "Sarah"
  const userDream = dreams.find(d => d.userId === userId);

  const [comments, setComments] = useState([
    { id: 1, user: 'Sarah', avatar: '👩🏻', text: 'Great streak! 🔥', time: '2h ago' },
    { id: 2, user: 'Mike', avatar: '🧔🏻‍♂️', text: 'How do you get so much deep sleep??', time: '1h ago' }
  ]);

  const handlePostComment = () => {
    if (!commentText.trim()) return;
    const newComment = {
      id: Date.now(),
      user: 'You',
      avatar: currentUser.avatar,
      text: commentText,
      time: 'Just now'
    };
    setComments([...comments, newComment]);
    setCommentText('');
  };

  return (
    <div style={styles.container}>
      {/* Yellow Header with Back Button */}
      <div style={styles.topSection}>
        <div style={styles.navHeader}>
          <button onClick={() => navigate(-1)} style={styles.backButton}>
            <ChevronLeft size={28} color="#2D3436" />
          </button>
        </div>
      </div>

      {/* "Name Slept for" Card - Merged Cutout Style */}
      <div style={styles.sleptForCard}>
        <div style={styles.avatarContainer}>
            <span style={{fontSize: '32px'}}>{user.avatar}</span>
        </div>
        <h2 style={styles.sleptForTitle}>
            {isCurrentUser ? "You slept for" : `${user.name.split(' ')[0]} slept for`}
        </h2>
        <div style={styles.sleptForValue}>
          {sleepStats.total}<span style={styles.sleptForUnit}>h</span>
        </div>
      </div>

      <div style={styles.content}>
        {/* Stats Row */}
        <div style={styles.statsRow}>
          {/* Times Card - No Edit Button */}
          <div style={styles.timesCard}>
            <div style={styles.timesHeaderRow}>
              <div style={styles.timeBlock}>
                <span style={styles.timeLabel}>FALL ASLEEP</span>
                <span style={styles.timeValue}>{sleepStats.fallAsleep}</span>
              </div>
              <div style={styles.timeBlock}>
                <span style={styles.timeLabel}>WAKE UP</span>
                <span style={styles.timeValue}>{sleepStats.wakeUp}</span>
              </div>
            </div>
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

        {/* Dream Section */}
        <h3 style={styles.sectionTitle}>Tonight's Dream</h3>
        <div style={styles.dreamCard}>
          {userDream ? (
            <>
              <div style={styles.dreamHeader}>
                <Moon size={20} color="#6B4C9A" fill="#6B4C9A" />
                <span style={styles.dreamLabel}>Recorded Dream</span>
              </div>
              <p style={styles.dreamText}>"{userDream.content}"</p>
            </>
          ) : (
             <div style={styles.emptyDreamState}>
               <Moon size={32} color="#CBD5E1" />
               <p style={styles.emptyDreamText}>No dreams recorded for this night.</p>
             </div>
          )}
        </div>

        {/* Sleep Insights (Read Only) */}
        <h3 style={styles.sectionTitle}>Sleep Insights</h3>
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

        {/* Comment Section */}
        <h3 style={styles.sectionTitle}>Friends' Activity</h3>
        <div style={styles.commentsSection}>
          <div style={styles.commentsList}>
            {comments.map(comment => (
              <div key={comment.id} style={styles.commentItem}>
                <div style={styles.commentAvatar}>{comment.avatar}</div>
                <div style={styles.commentContent}>
                  <div style={styles.commentHeader}>
                    <span style={styles.commentUser}>{comment.user}</span>
                    <span style={styles.commentTime}>{comment.time}</span>
                  </div>
                  <p style={styles.commentTextEntry}>{comment.text}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div style={styles.inputWrapper}>
            <input 
              type="text" 
              placeholder="Leave a comment..." 
              style={styles.commentInput}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handlePostComment()}
            />
            <button 
                style={{...styles.sendButton, opacity: commentText ? 1 : 0.5}} 
                onClick={handlePostComment}
                disabled={!commentText}
            >
              <Send size={18} color="white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Reusable Components (Same as Analytics) ---

const LegendItem = ({ label, time, color, icon: Icon }) => (
  <div style={styles.legendItem}>
    <span style={styles.legendTitle}>{label}</span>
    <span style={styles.legendTime}>{time}</span>
    <div style={{...styles.legendIconCircle, background: color}}>
       <Icon size={20} color="white" />
    </div>
  </div>
);

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
    return { x: center + radius * Math.cos(radians), y: center + radius * Math.sin(radians) };
  };

  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {rings.map((ring, i) => {
          const circumference = 2 * Math.PI * ring.r;
          return (
            <g key={i}>
              <circle cx={center} cy={center} r={ring.r} fill="none" stroke={ring.bg} strokeWidth={strokeWidth} />
              <circle cx={center} cy={center} r={ring.r} fill="none" stroke={ring.color} strokeWidth={strokeWidth} strokeLinecap="round" strokeDasharray={`${circumference * ring.percent} ${circumference}`} transform={`rotate(-90 ${center} ${center})`} />
            </g>
          );
        })}
      </svg>
      {rings.map((ring, i) => {
        const { x, y } = getCoordinates(ring.r, ring.percent);
        return (
          <div key={`icon-${i}`} style={{ position: 'absolute', left: x, top: y, transform: 'translate(-50%, -50%)', width: '24px', height: '24px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 10 }}>
            {ring.icon}
          </div>
        );
      })}
    </div>
  );
};

const styles = {
  container: { minHeight: '100vh', background: '#FFF9EE', position: 'relative', fontFamily: "'Inter', sans-serif", paddingBottom: '90px' },
  topSection: { background: '#FFCA5F', paddingBottom: '80px', borderBottomLeftRadius: '0', borderBottomRightRadius: '0' },
  navHeader: { padding: '20px 20px', display: 'flex', alignItems: 'center' },
  backButton: { background: 'white', border: 'none', borderRadius: '50%', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' },
  
  sleptForCard: { background: '#FFF9EE', marginTop: '-50px', marginLeft: '20px', marginRight: '20px', borderRadius: '40px', padding: '30px 24px', textAlign: 'center', position: 'relative', zIndex: 10 },
  avatarContainer: { position: 'absolute', top: '-40px', left: '50%', transform: 'translateX(-50%)', width: '64px', height: '64px', background: 'white', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' },
  sleptForTitle: { fontSize: '26px', fontWeight: '700', color: '#4A3B32', marginBottom: '8px', fontFamily: "'Lora', serif" },
  sleptForValue: { fontSize: '72px', fontWeight: '800', color: '#3D2E28', lineHeight: '1' },
  sleptForUnit: { fontSize: '36px', color: '#C7C7C7', marginLeft: '6px', fontWeight: '500' },
  
  content: { padding: '10px 20px 20px' },
  statsRow: { display: 'flex', gap: '12px', marginBottom: '32px' },
  timesCard: { flex: '1.4', background: '#FFCA5F', borderRadius: '32px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center' },
  timesHeaderRow: { display: 'flex', justifyContent: 'space-between', gap: '8px' },
  timeBlock: { display: 'flex', flexDirection: 'column' },
  timeLabel: { fontSize: '11px', fontWeight: '800', color: '#8A7A5A', marginBottom: '6px', textTransform: 'uppercase', opacity: 0.8 },
  timeValue: { fontSize: '18px', fontWeight: '900', color: '#1A1A1A' },
  qualityCard: { flex: '1', background: '#FFCA5F', borderRadius: '32px', padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' },
  qualityLabel: { fontSize: '13px', fontWeight: '700', color: '#8A7A5A', marginBottom: '4px', opacity: 0.9 },
  qualityValueContainer: { display: 'flex', alignItems: 'baseline' },
  qualityNumber: { fontSize: '56px', fontWeight: '900', color: '#1A1A1A', lineHeight: '1' },
  qualityPercent: { fontSize: '28px', fontWeight: '800', color: '#1A1A1A' },
  
  sectionTitle: { fontSize: '28px', fontWeight: '700', color: '#3D2E28', fontFamily: "'Lora', serif", marginBottom: '16px' },
  
  // Dream Section Styles
  dreamCard: { background: 'white', borderRadius: '28px', padding: '24px', marginBottom: '32px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)', border: '1px solid rgba(0,0,0,0.03)' },
  dreamHeader: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' },
  dreamLabel: { fontSize: '14px', fontWeight: '700', color: '#6B4C9A', textTransform: 'uppercase' },
  dreamText: { fontSize: '16px', color: '#4B5563', fontStyle: 'italic', lineHeight: '1.5', fontFamily: "'Lora', serif" },
  emptyDreamState: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', padding: '10px 0', opacity: 0.6 },
  emptyDreamText: { fontSize: '14px', color: '#64748B' },

  insightsCard: { background: '#F8F6F2', borderRadius: '40px', padding: '40px 10px', marginBottom: '32px' },
  chartContainer: { display: 'flex', justifyContent: 'center', marginBottom: '40px' },
  legendRow: { display: 'flex', justifyContent: 'space-evenly', padding: '0 10px' },
  legendItem: { display: 'flex', flexDirection: 'column', alignItems: 'center' },
  legendTitle: { fontSize: '12px', fontWeight: '800', color: '#9CA3AF', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' },
  legendTime: { fontSize: '20px', fontWeight: '800', color: '#1A1A1A', marginBottom: '16px' },
  legendIconCircle: { width: '56px', height: '56px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' },
  
  // Comments Styles
  commentsSection: { background: 'white', borderRadius: '32px', padding: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.03)' },
  commentsList: { display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '20px' },
  commentItem: { display: 'flex', gap: '12px' },
  commentAvatar: { width: '40px', height: '40px', borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 },
  commentContent: { flex: 1, background: '#F9FAFB', borderRadius: '16px', padding: '12px', borderTopLeftRadius: '4px' },
  commentHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px', alignItems: 'center' },
  commentUser: { fontSize: '14px', fontWeight: '700', color: '#1F2937' },
  commentTime: { fontSize: '11px', color: '#9CA3AF' },
  commentTextEntry: { fontSize: '14px', color: '#4B5563', lineHeight: '1.4' },
  
  inputWrapper: { display: 'flex', gap: '8px', alignItems: 'center', background: '#F3F4F6', padding: '8px', borderRadius: '24px' },
  commentInput: { flex: 1, border: 'none', background: 'transparent', padding: '8px 12px', fontSize: '14px', outline: 'none', color: '#374151' },
  sendButton: { width: '36px', height: '36px', borderRadius: '50%', background: '#2D3436', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'opacity 0.2s' }
};

export default DetailedSleepPage;