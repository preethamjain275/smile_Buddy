import { RefObject } from 'react';

interface CameraViewProps {
  videoRef: RefObject<HTMLVideoElement>;
  canvasRef: RefObject<HTMLCanvasElement>;
  capturedImage: string | null;
  faceDetected: boolean;
  themeColor: string;
  isFlashing: boolean;
}

export const CameraView = ({
  videoRef,
  canvasRef,
  capturedImage,
  faceDetected,
  themeColor,
  isFlashing,
}: CameraViewProps) => {
  return (
    <div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black">
      {capturedImage ? (
        <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
      ) : (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover scale-x-[-1]"
        />
      )}

      <canvas ref={canvasRef} className="hidden" />

      {!capturedImage && (
        <>
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/70 backdrop-blur-sm">
            <div
              className={`w-2 h-2 rounded-full ${faceDetected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}
            />
            <span className="text-xs font-mono text-white">
              {faceDetected ? 'FACE FOUND' : 'NO FACE'}
            </span>
          </div>

          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 transition-all duration-500"
              style={{ borderColor: themeColor }}
            />
            <div
              className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 transition-all duration-500"
              style={{ borderColor: themeColor }}
            />
            <div
              className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 transition-all duration-500"
              style={{ borderColor: themeColor }}
            />
            <div
              className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 transition-all duration-500"
              style={{ borderColor: themeColor }}
            />
          </div>
        </>
      )}

      {isFlashing && (
        <div className="absolute inset-0 bg-white animate-flash" />
      )}

      <style>{`
        @keyframes flash {
          0%, 100% { opacity: 0; }
          50% { opacity: 0.9; }
        }
        .animate-flash {
          animation: flash 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};
