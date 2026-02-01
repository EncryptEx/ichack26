// src/components/DreamLog.jsx
import { useRef, useState } from 'react';
import { Mic, X, Send, PenLine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { currentUser } from '../data/mockData';

const DreamLog = ({ dreams, onAddDream }) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dreamText, setDreamText] = useState('');

  const handleSubmit = () => {
    if (dreamText.trim()) {
      onAddDream(dreamText);
      setDreamText('');
      setIsModalOpen(false);
      setTimeout(() => {
        if(scrollRef.current) scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
      }, 100);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Dream Log</h2>
      
      {/* Scroll container takes full width, but applies padding inside */}
      <div style={styles.scrollContainer} ref={scrollRef} className="hide-scrollbar">
        
        {/* LOG BUTTON - Aligned properly now */}
        <div style={styles.logButton} onClick={() => setIsModalOpen(true)}>
          <div style={styles.logIconCircle}>
            <PenLine size={24} color="#2D3436" />
          </div>
          <span style={styles.logText}>Log Dream</span>
        </div>
        
        {dreams.map((dream) => {
           const isMyDream = dream.isNew || dream.userName === 'You';
           return (
            <div key={dream.id} style={isMyDream ? styles.myDreamCard : styles.dreamCard}>
                <div style={styles.cardHeader}>
                  <span style={{
                      ...styles.dreamAuthor, 
                      color: isMyDream ? '#6B4C9A' : '#2D3436'
                  }}>
                      {dream.userName}
                  </span>
                  {isMyDream && <div style={styles.newBadge} />}
                </div>
                <p style={styles.dreamContent}>{dream.content}</p>
            </div>
          );
        })}
        {/* Spacer for right side padding */}
        <div style={{minWidth: '20px'}} />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <>
          <div style={styles.overlay} onClick={() => setIsModalOpen(false)} />
          <div style={styles.bottomSheet}>
             <div style={styles.sheetHeader}>
               <h3 style={styles.sheetTitle}>Record Dream</h3>
               <button style={styles.closeButton} onClick={() => setIsModalOpen(false)}>
                 <div style={styles.closeIconBg}><X size={20} /></div>
               </button>
             </div>
             
             <div style={styles.sheetContent}>
                <textarea 
                  style={styles.textArea} 
                  placeholder="What did you dream about last night?" 
                  value={dreamText} 
                  onChange={(e) => setDreamText(e.target.value)} 
                  autoFocus
                />
                <div style={styles.inputActions}>
                   <button style={styles.micButton}><Mic size={24} color="#5B4A30" /></button>
                   <button 
                     style={{...styles.submitButton, opacity: dreamText.trim() ? 1 : 0.6}} 
                     onClick={handleSubmit}
                     disabled={!dreamText.trim()}
                    >
                     <span style={{marginRight: 8}}>Save to Log</span>
                     <Send size={18} fill="white" />
                   </button>
                </div>
             </div>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: { 
    padding: '8px 0 110px', 
    flexShrink: 0 
  },
  title: { 
    fontSize: '22px', 
    fontWeight: '700', 
    color: '#2D3436', 
    marginBottom: '12px', 
    paddingLeft: '24px', // Matches global page padding
    fontFamily: "'Lora', serif" 
  },
  scrollContainer: { 
    display: 'flex', 
    gap: '16px', 
    overflowX: 'auto', 
    paddingLeft: '24px', // THIS IS KEY FOR ALIGNMENT
    paddingBottom: '20px', // Space for shadows not to be cut off
    scrollSnapType: 'x mandatory' 
  },
  
  // New Log Button Style
  logButton: { 
    minWidth: '100px', 
    height: '150px', 
    background: '#FFCA5F', 
    borderRadius: '28px', 
    display: 'flex', 
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center', 
    flexShrink: 0, 
    scrollSnapAlign: 'start', 
    cursor: 'pointer',
    boxShadow: '0 8px 20px -6px rgba(255, 202, 95, 0.6)',
    transition: 'transform 0.1s'
  },
  logIconCircle: {
    width: '44px',
    height: '44px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px'
  },
  logText: { 
    fontWeight: '700', 
    color: '#3D2E1E', 
    fontSize: '13px',
    width: '60px',
    textAlign: 'center',
    lineHeight: '1.2'
  },
  
  // Cards
  dreamCard: { 
    minWidth: '180px', 
    maxWidth: '180px', 
    height: '150px', 
    background: 'white', 
    borderRadius: '28px', 
    padding: '20px', 
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)', 
    flexShrink: 0, 
    scrollSnapAlign: 'start', 
    position: 'relative',
    display: 'flex',
    flexDirection: 'column'
  },
  myDreamCard: { 
    minWidth: '180px', 
    maxWidth: '180px', 
    height: '150px', 
    background: '#FFF0F5', // Very light pink/purple
    border: '2px solid #FFD1DC',
    borderRadius: '28px', 
    padding: '18px', // Compensate for border
    boxShadow: '0 4px 15px rgba(233, 213, 255, 0.4)', 
    flexShrink: 0, 
    scrollSnapAlign: 'start', 
    position: 'relative',
    display: 'flex',
    flexDirection: 'column'
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px'
  },
  dreamAuthor: { fontSize: '14px', fontWeight: '700' },
  newBadge: { width: '8px', height: '8px', borderRadius: '50%', background: '#6B4C9A' },
  dreamContent: { 
    fontSize: '13px', 
    color: '#636E72', 
    lineHeight: '1.5', 
    fontFamily: "'Inter', sans-serif",
    flex: 1,
    overflow: 'hidden', 
    display: '-webkit-box', 
    WebkitLineClamp: 3, 
    WebkitBoxOrient: 'vertical' 
  },
  dreamTime: { fontSize: '11px', color: '#B2BEC3', marginTop: '8px', fontWeight: '500' },

  // Modal
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(45, 52, 54, 0.5)', backdropFilter: 'blur(4px)', zIndex: 1100 },
  bottomSheet: { 
    position: 'fixed', 
    bottom: '100px', 
    left: '50%', 
    transform: 'translateX(-50%)', 
    width: 'calc(100% - 40px)', 
    maxWidth: '440px', 
    background: '#FFF9EE', 
    borderRadius: '32px', 
    padding: '16px 24px 32px', 
    zIndex: 1101, 
    animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
    boxShadow: '0 20px 40px rgba(0,0,0,0.2)'
  },
  sheetHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', marginTop: '8px' },
  sheetTitle: { fontSize: '24px', fontWeight: '700', fontFamily: "'Lora', serif", color: '#2D3436' },
  closeButton: { background: 'none', border: 'none', cursor: 'pointer' },
  closeIconBg: { width: '32px', height: '32px', borderRadius: '50%', background: '#F0EBE0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#636E72' },
  sheetContent: { display: 'flex', flexDirection: 'column', gap: '16px' },
  textArea: { width: '100%', padding: '20px', borderRadius: '24px', border: 'none', background: 'white', fontSize: '16px', lineHeight: '1.5', height: '140px', resize: 'none', fontFamily: "'Inter', sans-serif", boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.03)' },
  inputActions: { display: 'flex', gap: '12px' },
  micButton: { width: '60px', height: '60px', borderRadius: '24px', border: 'none', background: '#FFCA5F', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.1s' },
  submitButton: { flex: 1, height: '60px', borderRadius: '24px', border: 'none', background: '#2D3436', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '600', fontSize: '16px', cursor: 'pointer', boxShadow: '0 8px 20px -4px rgba(45, 52, 54, 0.3)' }
};

export default DreamLog;