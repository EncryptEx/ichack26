import { useRef, useState } from 'react';
import { Mic, MicOff, X, Send } from 'lucide-react';

const DreamLog = ({ dreams }) => {
  const scrollRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [dreamText, setDreamText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);

  const handleLogClick = () => {
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setDreamText('');
    setIsRecording(false);
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  };

  const handleStartRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks = [];

      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        // Here you could send the blob to a speech-to-text service
        // For now, we'll just show a placeholder
        setDreamText(prev => prev + ' [Audio recorded] ');
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = () => {
    if (dreamText.trim()) {
      // Here you would typically save the dream to your backend
      console.log('Dream submitted:', dreamText);
      handleClose();
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Dream Log</h2>
      <div style={styles.scrollContainer} ref={scrollRef} className="hide-scrollbar">
        <div style={styles.logIcon} onClick={handleLogClick}>
          <span style={styles.logText}>Log</span>
        </div>
        {dreams.map((dream) => (
          <div key={dream.id} style={styles.dreamCard}>
            <span style={styles.dreamAuthor}>{dream.userName}</span>
            <p style={styles.dreamContent}>{dream.content}</p>
          </div>
        ))}
      </div>

      {/* Bottom Sheet Modal */}
      {isModalOpen && (
        <>
          <div style={styles.overlay} onClick={handleClose} />
          <div style={styles.bottomSheet}>
            <div style={styles.sheetHandle} />
            <div style={styles.sheetHeader}>
              <h3 style={styles.sheetTitle}>Log Your Dream</h3>
              <button style={styles.closeButton} onClick={handleClose}>
                <X size={24} />
              </button>
            </div>
            
            <div style={styles.sheetContent}>
              <textarea
                style={styles.textArea}
                placeholder="Describe your dream..."
                value={dreamText}
                onChange={(e) => setDreamText(e.target.value)}
                rows={5}
              />
              
              <div style={styles.inputActions}>
                <button
                  style={{
                    ...styles.micButton,
                    background: isRecording ? '#E54D4D' : '#FFCA5F',
                  }}
                  onClick={isRecording ? handleStopRecording : handleStartRecording}
                >
                  {isRecording ? <MicOff size={24} color="#fff" /> : <Mic size={24} color="#2D3436" />}
                </button>
                
                <button
                  style={{
                    ...styles.submitButton,
                    opacity: dreamText.trim() ? 1 : 0.5,
                  }}
                  onClick={handleSubmit}
                  disabled={!dreamText.trim()}
                >
                  <Send size={20} color="#fff" />
                  <span>Save Dream</span>
                </button>
              </div>
              
              {isRecording && (
                <div style={styles.recordingIndicator}>
                  <span style={styles.recordingDot} />
                  Recording...
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '24px 0 32px',
    flexShrink: 0,
    minHeight: '220px',
  },
  title: {
    fontSize: '24px',
    fontWeight: '700',
    color: '#2D3436',
    marginBottom: '16px',
    paddingLeft: '36px',
    fontFamily: "'Lora', serif",
  },
  scrollContainer: {
    display: 'flex',
    gap: '14px',
    overflowX: 'auto',
    overflowY: 'hidden',
    paddingLeft: '36px',
    paddingRight: '0',
    paddingBottom: '8px',
    scrollSnapType: 'x mandatory',
  },
  logIcon: {
    minWidth: '65px',
    height: '140px',
    background: '#FFCA5F',
    borderRadius: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    scrollSnapAlign: 'start',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  logText: {
    writingMode: 'vertical-rl',
    textOrientation: 'mixed',
    transform: 'rotate(180deg)',
    fontWeight: '700',
    color: '#2D3436',
    fontSize: '17px',
  },
  dreamCard: {
    minWidth: '160px',
    maxWidth: '160px',
    height: '140px',
    background: 'white',
    borderRadius: '24px',
    padding: '16px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
    flexShrink: 0,
    scrollSnapAlign: 'start',
    overflow: 'hidden',
  },
  dreamAuthor: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#2D3436',
    display: 'block',
    marginBottom: '8px',
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
  // Modal styles
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.4)',
    zIndex: 100,
  },
  bottomSheet: {
    position: 'fixed',
    bottom: 0,
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '480px',
    background: '#FFF9EE',
    borderTopLeftRadius: '24px',
    borderTopRightRadius: '24px',
    padding: '12px 20px 32px',
    zIndex: 101,
    animation: 'slideUp 0.3s ease-out',
  },
  sheetHandle: {
    width: '40px',
    height: '4px',
    background: '#D0D0D0',
    borderRadius: '2px',
    margin: '0 auto 16px',
  },
  sheetHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  },
  sheetTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#2D3436',
    fontFamily: "'Lora', serif",
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#636E72',
    padding: '4px',
  },
  sheetContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  textArea: {
    width: '100%',
    padding: '16px',
    borderRadius: '16px',
    border: '2px solid #E0E0E0',
    fontSize: '15px',
    fontFamily: "'Inter', sans-serif",
    resize: 'none',
    outline: 'none',
    background: 'white',
    transition: 'border-color 0.2s',
  },
  inputActions: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  micButton: {
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    border: 'none',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'transform 0.2s, background 0.2s',
    flexShrink: 0,
  },
  submitButton: {
    flex: 1,
    height: '56px',
    borderRadius: '28px',
    border: 'none',
    background: '#5B93CC',
    color: 'white',
    fontSize: '16px',
    fontWeight: '600',
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'opacity 0.2s',
  },
  recordingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#E54D4D',
    fontSize: '14px',
    fontWeight: '500',
  },
  recordingDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: '#E54D4D',
    animation: 'pulse 1s infinite',
  },
};

export default DreamLog;
