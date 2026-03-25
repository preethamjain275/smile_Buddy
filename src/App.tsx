import { useState, useRef, useEffect } from 'react';
import { useAppData } from './hooks/useAppData';
import { SmileShot } from './components/SmileShot';
import { FunnyBackground } from './components/FunnyBackground';
import { AdminPanel } from './components/AdminPanel';

function App() {
  const { roastMessages, smileMessages, settings, loading, reloadData } = useAppData();
  const [headerBounce, setHeaderBounce] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const tagline = 'Camera app that locks until you smile';
  const hasSpokenRef = useRef(false);

  const speakTagline = () => {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(tagline);
    utterance.rate = 0.95;
    utterance.pitch = 1.1;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  // Auto-speak tagline on the first user interaction (browsers require a gesture)
  useEffect(() => {
    const handleFirstInteraction = () => {
      if (!hasSpokenRef.current) {
        hasSpokenRef.current = true;
        speakTagline();
        window.removeEventListener('click', handleFirstInteraction);
        window.removeEventListener('keydown', handleFirstInteraction);
        window.removeEventListener('touchstart', handleFirstInteraction);
      }
    };
    window.addEventListener('click', handleFirstInteraction);
    window.addEventListener('keydown', handleFirstInteraction);
    window.addEventListener('touchstart', handleFirstInteraction);
    return () => {
      window.removeEventListener('click', handleFirstInteraction);
      window.removeEventListener('keydown', handleFirstInteraction);
      window.removeEventListener('touchstart', handleFirstInteraction);
    };
  }, []);

  const handleSpeakTagline = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    speakTagline();
  };

  const themeColors = (settings.themeColors as Record<string, string>) || {
    level0: '#00ff88',
  };

  const handleDataUpdate = () => {
    reloadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#00000a] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⏳</div>
          <p className="text-xl text-white font-mono">Loading SmileShot...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#00000a] relative overflow-hidden">
      <FunnyBackground themeColor={themeColors.level0} />

      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="py-8 text-center animate-slideUp">
          <h1
            className={`text-5xl md:text-7xl font-bold mb-2 ${headerBounce ? 'animate-bounce' : ''}`}
            style={{
              fontFamily: "'Bebas Neue', sans-serif",
              background: `linear-gradient(135deg, ${themeColors.level0}, #fff)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            SMILESHOT
          </h1>
          <p className="text-lg md:text-xl text-gray-400 font-mono inline-flex items-center gap-2">
            Camera app that locks until you smile
            <button
              onClick={handleSpeakTagline}
              title={isSpeaking ? 'Stop' : 'Listen to tagline'}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '1.2rem',
                lineHeight: 1,
                padding: '2px 4px',
                borderRadius: '6px',
                transition: 'transform 0.2s, opacity 0.2s',
                opacity: isSpeaking ? 1 : 0.6,
                animation: isSpeaking ? 'speakerPulse 0.8s ease-in-out infinite' : 'none',
                verticalAlign: 'middle',
              }}
            >
              {isSpeaking ? '🔊' : '🔈'}
            </button>
          </p>
        </header>

        <main className="flex-1 flex items-center justify-center py-8">
          <SmileShot
            roastMessages={roastMessages}
            smileMessages={smileMessages}
            settings={settings}
          />
        </main>

        <footer className="py-6 text-center text-gray-500 text-sm font-mono">
          <p>Built with face-api.js • React • Supabase</p>
        </footer>
      </div>

      <AdminPanel onDataUpdate={handleDataUpdate} />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Chakra+Petch:wght@400;600;700&family=Space+Mono:wght@400;700&display=swap');

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slideUp {
          animation: slideUp 0.8s ease-out;
        }

        @keyframes speakerPulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.25); opacity: 0.7; }
        }
      `}</style>
    </div>
  );
}

export default App;
