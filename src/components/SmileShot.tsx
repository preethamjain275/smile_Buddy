import { useEffect, useState, useCallback, useRef } from 'react';

// Strip emojis/symbols so TTS sounds natural
const stripEmojis = (text: string) =>
  text.replace(/[\u{1F000}-\u{1FFFF}\u{2600}-\u{27BF}\u{2300}-\u{23FF}✨🎉🔥💀😊😐😤😡📸🔒🍲🥳🤷😴⭐🎊🏆🥇💪👏🤩🫡]/gu, '').trim();
import { useCamera } from '../hooks/useCamera';
import { useFaceDetection } from '../hooks/useFaceDetection';
import { useAudio } from '../hooks/useAudio';
import { CameraView } from './CameraView';
import { RoastBox } from './RoastBox';
import { SmileMeter } from './SmileMeter';
import { Particles } from './Particles';
import { RoastMessage, SmileDetectedMessage } from '../lib/supabaseClient';

interface SmileShotProps {
  roastMessages: RoastMessage[];
  smileMessages: SmileDetectedMessage[];
  settings: Record<string, unknown>;
}

export const SmileShot = ({ roastMessages, smileMessages, settings }: SmileShotProps) => {
  const [appState, setAppState] = useState<'idle' | 'loading' | 'active' | 'captured'>('idle');
  const [isSmiling, setIsSmiling] = useState(false);
  const [currentRoastLevel, setCurrentRoastLevel] = useState(0);
  const [currentMessage, setCurrentMessage] = useState('');
  const [timeWithoutSmile, setTimeWithoutSmile] = useState(0);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [photoCount, setPhotoCount] = useState(0);
  const [isFlashing, setIsFlashing] = useState(false);
  const [showParticles, setShowParticles] = useState(false);

  const messageIndexRef = useRef(0);
  const timerRef = useRef<number | null>(null);
  const messageTimerRef = useRef<number | null>(null);

  const { videoRef, canvasRef, cameraError, startCamera, stopCamera, capturePhoto } = useCamera();
  const { playAudio, stopAudio } = useAudio();

  const themeColors = (settings.themeColors as Record<string, string>) || {
    level0: '#00ff88',
    level1: '#ffdd00',
    level2: '#ff9900',
    level3: '#ff4444',
    level4: '#ff00ff',
  };

  const timingSettings = (settings.timingSettings as Record<string, number>) || {
    commentRotation: 3500,
    detectionInterval: 250,
    level0Max: 5000,
    level1Max: 15000,
    level2Max: 30000,
    level3Max: 60000,
  };

  const detectionSettings = (settings.detectionSettings as Record<string, number>) || {
    smileThreshold: 0.65,
  };

  const currentThemeColor = themeColors[`level${currentRoastLevel}` as keyof typeof themeColors];

  const getMessagesByLevel = useCallback((level: number) => {
    return roastMessages.filter((msg) => msg.level === level);
  }, [roastMessages]);

  const updateRoastLevel = useCallback((time: number) => {
    if (time < timingSettings.level0Max) return 0;
    if (time < timingSettings.level1Max) return 1;
    if (time < timingSettings.level2Max) return 2;
    if (time < timingSettings.level3Max) return 3;
    return 4;
  }, [timingSettings]);

  const speakText = useCallback((text: string) => {
    window.speechSynthesis.cancel();
    const clean = stripEmojis(text);
    if (!clean) return;
    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    window.speechSynthesis.speak(utterance);
  }, []);

  const showNextRoastMessage = useCallback(() => {
    const messagesForLevel = getMessagesByLevel(currentRoastLevel);
    if (messagesForLevel.length === 0) return;

    const message = messagesForLevel[messageIndexRef.current % messagesForLevel.length];
    setCurrentMessage(message.message);
    speakText(message.message);
    if (message.audio_url) {
      playAudio(message.audio_url);
    }
    messageIndexRef.current++;
  }, [currentRoastLevel, getMessagesByLevel, playAudio, speakText]);

  const showSmileMessage = useCallback(() => {
    if (smileMessages.length === 0) return;
    const message = smileMessages[Math.floor(Math.random() * smileMessages.length)];
    setCurrentMessage(message.message);
    speakText(message.message);
    if (message.audio_url) {
      playAudio(message.audio_url);
    }
  }, [smileMessages, playAudio, speakText]);

  const { isModelLoaded, smileScore, faceDetected, startDetection, stopDetection } = useFaceDetection({
    onSmileDetected: () => {
      setIsSmiling(true);
      showSmileMessage();
    },
    onSmileLost: () => {
      setIsSmiling(false);
      showNextRoastMessage();
    },
  });

  useEffect(() => {
    if (appState === 'active' && !isSmiling) {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = window.setInterval(() => {
        setTimeWithoutSmile((prev) => {
          const newTime = prev + 100;
          const newLevel = updateRoastLevel(newTime);
          if (newLevel !== currentRoastLevel) {
            setCurrentRoastLevel(newLevel);
            messageIndexRef.current = 0;
          }
          return newTime;
        });
      }, 100);

      if (messageTimerRef.current) clearInterval(messageTimerRef.current);
      messageTimerRef.current = window.setInterval(() => {
        showNextRoastMessage();
      }, timingSettings.commentRotation);

      showNextRoastMessage();
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (messageTimerRef.current) clearInterval(messageTimerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (messageTimerRef.current) clearInterval(messageTimerRef.current);
    };
  }, [appState, isSmiling, currentRoastLevel, showNextRoastMessage, updateRoastLevel, timingSettings]);

  const handleStart = async () => {
    setAppState('loading');
    await startCamera();
    if (videoRef.current && isModelLoaded) {
      startDetection(videoRef.current, timingSettings.detectionInterval, detectionSettings.smileThreshold);
      setAppState('active');
    }
  };

  const handleCapture = () => {
    const image = capturePhoto();
    if (image) {
      setCapturedImage(image);
      setIsFlashing(true);
      setShowParticles(true);
      setTimeout(() => setIsFlashing(false), 300);
      setTimeout(() => setShowParticles(false), 100);
      setPhotoCount((prev) => prev + 1);
      setAppState('captured');
      stopDetection();
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setTimeWithoutSmile(0);
    setCurrentRoastLevel(0);
    setIsSmiling(false);
    messageIndexRef.current = 0;
    setAppState('active');
    if (videoRef.current) {
      startDetection(videoRef.current, timingSettings.detectionInterval, detectionSettings.smileThreshold);
    }
  };

  const handleDownload = () => {
    if (!capturedImage) return;
    const link = document.createElement('a');
    link.href = capturedImage;
    link.download = `smileshot-${Date.now()}.png`;
    link.click();
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    stopAudio();
    stopCamera();
    stopDetection();
    setCapturedImage(null);
    setTimeWithoutSmile(0);
    setCurrentRoastLevel(0);
    setIsSmiling(false);
    setAppState('idle');
  };

  if (cameraError) {
    return (
      <div className="text-center p-8">
        <p className="text-2xl mb-4">{cameraError}</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4">
      <Particles trigger={showParticles} />

      <div
        className="relative p-6 md:p-8 rounded-2xl transition-all duration-500"
        style={{
          backgroundColor: '#0a0a0a',
          border: `2px solid ${currentThemeColor}`,
          boxShadow: `0 0 60px ${currentThemeColor}66`,
        }}
      >
        <CameraView
          videoRef={videoRef}
          canvasRef={canvasRef}
          capturedImage={capturedImage}
          faceDetected={faceDetected}
          themeColor={currentThemeColor}
          isFlashing={isFlashing}
        />

        {appState === 'active' && (
          <div className="mt-6 space-y-4">
            <RoastBox
              message={currentMessage}
              currentLevel={currentRoastLevel}
              themeColor={currentThemeColor}
              isSmiling={isSmiling}
            />

            <SmileMeter score={smileScore} themeColor={currentThemeColor} />

            <div className="flex flex-wrap gap-4 text-sm font-mono text-gray-400">
              <div>Time: {(timeWithoutSmile / 1000).toFixed(1)}s</div>
              <div>Happiness: {Math.round(smileScore * 100)}%</div>
              <div>Face: {faceDetected ? '✓' : '✗'}</div>
            </div>
          </div>
        )}

        <div className="mt-6 flex flex-wrap gap-4 justify-center">
          {appState === 'idle' && (
            <button
              onClick={handleStart}
              className="px-8 py-3 rounded-xl font-bold text-lg transition-all"
              style={{
                backgroundColor: currentThemeColor,
                color: '#000',
                boxShadow: `0 0 20px ${currentThemeColor}`,
              }}
            >
              {isModelLoaded ? 'Start Camera 📸' : 'Loading Models...'}
            </button>
          )}

          {appState === 'active' && (
            <>
              <button
                onClick={handleCapture}
                disabled={!isSmiling}
                className="px-8 py-3 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: isSmiling ? currentThemeColor : '#333',
                  color: isSmiling ? '#000' : '#666',
                  boxShadow: isSmiling ? `0 0 30px ${currentThemeColor}` : 'none',
                  animation: isSmiling ? 'pulse 1s ease-in-out infinite' : 'none',
                }}
              >
                {isSmiling ? 'TAKE PHOTO! 📸' : '🔒 SMILE TO UNLOCK'}
              </button>
              <button
                onClick={handleStop}
                className="px-8 py-3 rounded-xl font-bold text-lg bg-red-500 hover:bg-red-600 transition-all"
              >
                Stop
              </button>
            </>
          )}

          {appState === 'captured' && (
            <>
              <button
                onClick={handleDownload}
                className="px-8 py-3 rounded-xl font-bold text-lg transition-all"
                style={{
                  backgroundColor: currentThemeColor,
                  color: '#000',
                }}
              >
                Download 💾
              </button>
              <button
                onClick={handleRetake}
                className="px-8 py-3 rounded-xl font-bold text-lg bg-gray-700 hover:bg-gray-600 transition-all"
              >
                Retake 🔄
              </button>
              <button
                onClick={handleStop}
                className="px-8 py-3 rounded-xl font-bold text-lg bg-red-500 hover:bg-red-600 transition-all"
              >
                Stop
              </button>
            </>
          )}
        </div>

        {photoCount > 0 && (
          <p className="text-center mt-4 text-gray-400 font-mono">
            Photos captured this session: {photoCount}
          </p>
        )}
      </div>
    </div>
  );
};
