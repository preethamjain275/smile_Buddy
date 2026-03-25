import { useEffect, useState } from 'react';

interface FunnyBackgroundProps {
  themeColor: string;
}

export const FunnyBackground = ({ themeColor }: FunnyBackgroundProps) => {
  const [emojis] = useState(() => {
    const emojiList = ['😊', '😃', '😄', '😁', '😆', '😂', '🤣', '😎', '🥳', '🎉', '✨', '💫', '⭐', '🌟', '💥', '🎊', '🎈', '🎭', '🎪', '🎨', '🎯', '🎲', '🎮', '🎸', '🎺', '🎹', '🎤'];
    return Array.from({ length: 30 }, (_, i) => ({
      id: i,
      emoji: emojiList[Math.floor(Math.random() * emojiList.length)],
      left: Math.random() * 100,
      delay: Math.random() * 20,
      duration: 15 + Math.random() * 10,
      size: 20 + Math.random() * 30,
    }));
  });

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `radial-gradient(circle at 50% 50%, ${themeColor}22 0%, transparent 70%)`,
        }}
      />

      <div className="absolute inset-0" style={{
        backgroundImage: `
          linear-gradient(${themeColor}15 1px, transparent 1px),
          linear-gradient(90deg, ${themeColor}15 1px, transparent 1px)
        `,
        backgroundSize: '50px 50px',
        animation: 'gridScroll 20s linear infinite',
      }} />

      {emojis.map((emoji) => (
        <div
          key={emoji.id}
          className="absolute animate-float"
          style={{
            left: `${emoji.left}%`,
            bottom: '-10%',
            fontSize: `${emoji.size}px`,
            animationDelay: `${emoji.delay}s`,
            animationDuration: `${emoji.duration}s`,
            opacity: 0.3,
          }}
        >
          {emoji.emoji}
        </div>
      ))}

      <style>{`
        @keyframes float {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-120vh) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes gridScroll {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(50px);
          }
        }

        .animate-float {
          animation: float linear infinite;
        }
      `}</style>
    </div>
  );
};
