import { useEffect, useState } from 'react';

interface RoastBoxProps {
  message: string;
  currentLevel: number;
  themeColor: string;
  isSmiling: boolean;
}

export const RoastBox = ({ message, currentLevel, themeColor, isSmiling }: RoastBoxProps) => {
  const [displayMessage, setDisplayMessage] = useState(message);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (message !== displayMessage) {
      setIsAnimating(true);
      setTimeout(() => {
        setDisplayMessage(message);
        setIsAnimating(false);
      }, 200);
    }
  }, [message, displayMessage]);

  const levelEmojis = ['😊', '😐', '😤', '😡', '💀'];

  return (
    <div className="space-y-4">
      <div
        className="relative p-6 rounded-xl transition-all duration-500 min-h-[120px] flex items-center justify-center"
        style={{
          backgroundColor: isSmiling ? `${themeColor}22` : '#1a1a1a',
          border: `2px solid ${themeColor}`,
          boxShadow: `0 0 30px ${themeColor}66`,
        }}
      >
        <p
          className={`text-xl md:text-2xl font-bold text-center transition-all duration-200 ${
            isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
          }`}
          style={{
            color: isSmiling ? themeColor : '#fff',
            fontFamily: "'Chakra Petch', sans-serif",
          }}
        >
          {displayMessage}
        </p>
      </div>

      <div className="flex justify-center gap-3">
        {levelEmojis.map((emoji, index) => (
          <div
            key={index}
            className={`text-3xl transition-all duration-500 ${
              index === currentLevel ? 'scale-125 animate-pulse' : 'scale-100 opacity-30'
            }`}
            style={{
              filter: index === currentLevel ? `drop-shadow(0 0 10px ${themeColor})` : 'none',
            }}
          >
            {emoji}
          </div>
        ))}
      </div>
    </div>
  );
};
