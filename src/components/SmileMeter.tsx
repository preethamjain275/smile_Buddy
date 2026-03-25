interface SmileMeterProps {
  score: number;
  themeColor: string;
}

export const SmileMeter = ({ score, themeColor }: SmileMeterProps) => {
  const percentage = Math.round(score * 100);
  const segments = 20;
  const filledSegments = Math.round((score * segments));

  const getSegmentColor = (index: number) => {
    if (index >= filledSegments) return '#333';

    if (percentage < 30) return '#ff4444';
    if (percentage < 65) return '#ffdd00';
    return themeColor;
  };

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-mono text-gray-400">SMILE METER</span>
        <span className="text-sm font-mono font-bold" style={{ color: themeColor }}>
          {percentage}%
        </span>
      </div>
      <div className="flex gap-1">
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className="flex-1 h-3 rounded-sm transition-all duration-300"
            style={{
              backgroundColor: getSegmentColor(i),
              boxShadow: i < filledSegments ? `0 0 8px ${getSegmentColor(i)}` : 'none',
            }}
          />
        ))}
      </div>
    </div>
  );
};
