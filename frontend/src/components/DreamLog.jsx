import { useRef, useState } from 'react';
import { Mic, MicOff, X, Send } from 'lucide-react';

const DreamLog = ({ dreams, onAddDream }) => {
  const scrollRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dreamText, setDreamText] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  // ... [Recording logic remains the same] ...

  const handleSubmit = () => {
    if (dreamText.trim()) {
      onAddDream(dreamText); // Call parent function
      setDreamText('');
      setIsModalOpen(false);
      // Optional: Scroll to start to see new dream
      if(scrollRef.current) scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Dream Log</h2>
      <div style={styles.scrollContainer} ref={scrollRef} className="hide-scrollbar">
        <div style={styles.logIcon} onClick={() => setIsModalOpen(true)}>
          <span style={styles.logText}>Log</span>
        </div>
        
        {dreams.map((dream) => {
           // Custom style for the current user's newly added dreams
           const isMyDream = dream.isNew || dream.userName === 'You';
           const cardStyle = isMyDream 
             ? { ...styles.dreamCard, ...styles.myDreamCard } 
             : styles.dreamCard;

           return (
            <div key={dream.id} style={cardStyle}>
                <span style={{
                    ...styles.dreamAuthor, 
                    color: isMyDream ? '#6B4C9A' : '#2D3436'
                }}>
                    {dream.userName}
                </span>
                <p style={styles.dreamContent}>{dream.content}</p>
                {isMyDream && <div style={styles.newBadge}></div>}
            </div>
          );
        })}
      </div>

      {/* ... [Modal Code remains almost the same, just ensures handleSubmit is called] ... */}
      {isModalOpen && (
        <>
          <div style={styles.overlay} onClick={() => setIsModalOpen(false)} />
          <div style={styles.bottomSheet}>
             {/* ... Header ... */}
             <div style={styles.sheetHeader}>
               <h3 style={styles.sheetTitle}>Log Your Dream</h3>
               <button style={styles.closeButton} onClick={() => setIsModalOpen(false)}><X size={24} /></button>
             </div>
             
             {/* ... Content ... */}
             <div style={styles.sheetContent}>
                <textarea 
                  style={styles.textArea} 
                  placeholder="Describe your dream..." 
                  value={dreamText} 
                  onChange={(e) => setDreamText(e.target.value)} 
                />
                <div style={styles.inputActions}>
                   {/* Mic button (visual only for now) */}
                   <button style={styles.micButton}><Mic size={24} /></button>
                   <button 
                     style={{...styles.submitButton, opacity: dreamText.trim() ? 1 : 0.5}} 
                     onClick={handleSubmit}
                     disabled={!dreamText.trim()}
                    >
                     <Send size={20} color="#fff" />
                     <span>Save Dream</span>
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
  container: { padding: '24px 0 32px', flexShrink: 0, minHeight: '220px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#2D3436', marginBottom: '16px', paddingLeft: '36px', fontFamily: "'Lora', serif" },
  scrollContainer: { display: 'flex', gap: '14px', overflowX: 'auto', overflowY: 'hidden', paddingLeft: '36px', paddingRight: '20px', paddingBottom: '8px', scrollSnapType: 'x mandatory' },
  logIcon: { minWidth: '65px', height: '140px', background: '#FFCA5F', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, scrollSnapAlign: 'start', cursor: 'pointer' },
  logText: { writingMode: 'vertical-rl', textOrientation: 'mixed', transform: 'rotate(180deg)', fontWeight: '700', color: '#2D3436', fontSize: '17px' },
  
  // Standard Dream Card
  dreamCard: { minWidth: '160px', maxWidth: '160px', height: '140px', background: 'white', borderRadius: '24px', padding: '16px', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', flexShrink: 0, scrollSnapAlign: 'start', overflow: 'hidden', position: 'relative' },
  
  // Distinct UI for User's Dream (Lavender tint + Border)
  myDreamCard: { background: '#F3E8FF', border: '2px solid #E9D5FF' },
  
  dreamAuthor: { fontSize: '15px', fontWeight: '700', display: 'block', marginBottom: '8px' },
  dreamContent: { fontSize: '12px', color: '#636E72', lineHeight: '1.3', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' },
  
  // A small dot to indicate "New"
  newBadge: { position: 'absolute', top: '16px', right: '16px', width: '8px', height: '8px', borderRadius: '50%', background: '#6B4C9A' },

  // Modal Styles (abbreviated for brevity, assuming existing styles)
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', zIndex: 100 },
  bottomSheet: { position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)', width: '100%', maxWidth: '480px', background: '#FFF9EE', borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '12px 20px 32px', zIndex: 101, animation: 'slideUp 0.3s ease-out' },
  sheetHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: '20px' },
  sheetTitle: { fontSize: '20px', fontWeight: '600', fontFamily: "'Lora', serif" },
  closeButton: { background: 'none', border: 'none' },
  sheetContent: { display: 'flex', flexDirection: 'column', gap: '16px' },
  textArea: { width: '100%', padding: '16px', borderRadius: '16px', border: '2px solid #E0E0E0', fontSize: '15px', height: '120px', resize: 'none' },
  inputActions: { display: 'flex', gap: '12px' },
  micButton: { width: '56px', height: '56px', borderRadius: '50%', border: 'none', background: '#FFCA5F', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  submitButton: { flex: 1, height: '56px', borderRadius: '28px', border: 'none', background: '#5B93CC', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: '600' }
};

export default DreamLog;