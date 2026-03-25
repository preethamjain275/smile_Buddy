import { useRef, useState, useCallback, useEffect } from 'react';

interface FaceDetectionCallbacks {
  onSmileDetected?: () => void;
  onSmileLost?: () => void;
  onFaceFound?: () => void;
  onFaceLost?: () => void;
}

declare global {
  interface Window {
    faceapi: {
      nets: {
        tinyFaceDetector: { loadFromUri: (uri: string) => Promise<void> };
        faceExpressionNet: { loadFromUri: (uri: string) => Promise<void> };
      };
      detectSingleFace: (input: HTMLVideoElement, options: unknown) => Promise<{
        expressions?: { happy?: number };
      } | undefined>;
      TinyFaceDetectorOptions: new () => unknown;
    };
  }
}

export const useFaceDetection = (callbacks: FaceDetectionCallbacks = {}) => {
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [smileScore, setSmileScore] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const detectionIntervalRef = useRef<number | null>(null);
  const wasSmiling = useRef(false);
  const wasFaceDetected = useRef(false);

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/face-api.js@0.22.2/dist/face-api.min.js';
      script.async = true;

      await new Promise<void>((resolve, reject) => {
        script.onload = () => resolve();
        script.onerror = () => reject(new Error('Failed to load face-api.js'));
        document.body.appendChild(script);
      });

      await Promise.all([
        window.faceapi.nets.tinyFaceDetector.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'),
        window.faceapi.nets.faceExpressionNet.loadFromUri('https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model'),
      ]);

      setIsModelLoaded(true);
    } catch (error) {
      console.error('Face detection models failed to load:', error);
    }
  };

  const detectFace = useCallback(async (videoElement: HTMLVideoElement, smileThreshold: number) => {
    if (!window.faceapi || !isModelLoaded) return;

    try {
      const detection = await window.faceapi
        .detectSingleFace(videoElement, new window.faceapi.TinyFaceDetectorOptions())
        .withFaceExpressions();

      if (detection && detection.expressions) {
        const happiness = detection.expressions.happy || 0;
        setSmileScore(happiness);

        if (!wasFaceDetected.current) {
          setFaceDetected(true);
          wasFaceDetected.current = true;
          callbacks.onFaceFound?.();
        }

        if (happiness >= smileThreshold && !wasSmiling.current) {
          wasSmiling.current = true;
          callbacks.onSmileDetected?.();
        } else if (happiness < smileThreshold && wasSmiling.current) {
          wasSmiling.current = false;
          callbacks.onSmileLost?.();
        }
      } else {
        setSmileScore(0);
        if (wasFaceDetected.current) {
          setFaceDetected(false);
          wasFaceDetected.current = false;
          wasSmiling.current = false;
          callbacks.onFaceLost?.();
        }
      }
    } catch (error) {
      console.error('Detection error:', error);
    }
  }, [isModelLoaded, callbacks]);

  const startDetection = useCallback((videoElement: HTMLVideoElement, interval = 250, smileThreshold = 0.65) => {
    if (detectionIntervalRef.current) {
      window.clearInterval(detectionIntervalRef.current);
    }

    detectionIntervalRef.current = window.setInterval(() => {
      detectFace(videoElement, smileThreshold);
    }, interval);
  }, [detectFace]);

  const stopDetection = useCallback(() => {
    if (detectionIntervalRef.current) {
      window.clearInterval(detectionIntervalRef.current);
      detectionIntervalRef.current = null;
    }
    setSmileScore(0);
    setFaceDetected(false);
    wasSmiling.current = false;
    wasFaceDetected.current = false;
  }, []);

  return {
    isModelLoaded,
    smileScore,
    faceDetected,
    startDetection,
    stopDetection,
  };
};
