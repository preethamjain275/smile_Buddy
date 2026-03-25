import { useRef, useCallback } from 'react';

export const useAudio = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioUrl = useRef<string>('');

  const playAudio = useCallback((audioUrl: string | null) => {
    if (!audioUrl) return;

    if (audioRef.current && currentAudioUrl.current === audioUrl) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch(err => console.log('Audio play failed:', err));
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    const audio = new Audio(audioUrl);
    audio.volume = 0.7;
    audioRef.current = audio;
    currentAudioUrl.current = audioUrl;

    audio.play().catch(err => console.log('Audio play failed:', err));
  }, []);

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      currentAudioUrl.current = '';
    }
  }, []);

  return { playAudio, stopAudio };
};
