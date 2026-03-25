import { useEffect, useState } from 'react';

interface Particle {
  id: number;
  emoji: string;
  left: number;
  delay: number;
  rotation: number;
}

interface ParticlesProps {
  trigger: boolean;
}

export const Particles = ({ trigger }: ParticlesProps) => {
  const [particles, setParticles] = useState<Particle[]>([]);

  useEffect(() => {
    if (trigger) {
      const emojiList = ['🎉', '✨', '😄', '🎊', '💫', '🥳', '⭐', '💥'];
      const newParticles = Array.from({ length: 40 }, (_, i) => ({
        id: Date.now() + i,
        emoji: emojiList[Math.floor(Math.random() * emojiList.length)],
        left: 20 + Math.random() * 60,
        delay: Math.random() * 0.5,
        rotation: Math.random() * 360,
      }));
      setParticles(newParticles);

      setTimeout(() => {
        setParticles([]);
      }, 3000);
    }
  }, [trigger]);

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute bottom-0 text-4xl animate-particle-burst"
          style={{
            left: `${particle.left}%`,
            animationDelay: `${particle.delay}s`,
            transform: `rotate(${particle.rotation}deg)`,
          }}
        >
          {particle.emoji}
        </div>
      ))}
      <style>{`
        @keyframes particleBurst {
          0% {
            transform: translateY(0) scale(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translateY(-100vh) scale(1.5) rotate(720deg);
            opacity: 0;
          }
        }

        .animate-particle-burst {
          animation: particleBurst 2s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
