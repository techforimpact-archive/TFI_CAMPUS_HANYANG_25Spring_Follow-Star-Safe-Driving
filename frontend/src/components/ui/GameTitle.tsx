interface GameTitleProps {
  text: string;
  fontSize?: string;
  color?: string;
  strokeWidth?: string;
  strokeColor?: string;
  className?: string;
  letterSpacing?: string; // 새 속성 추가
}

const GameTitle = ({ 
  text, 
  fontSize = '80px',
  color = 'text-[#0DA429]',
  strokeWidth = '12px',
  strokeColor = '#FFFAFA',
  className = '',
  letterSpacing = 'normal'
}: GameTitleProps) => {
  return (
    <h2 
      className={`font-black whitespace-nowrap ${color} ${className}`}
      style={{
        fontSize: fontSize,
        letterSpacing: letterSpacing,
        WebkitTextStroke: `${strokeWidth} ${strokeColor}`,
        paintOrder: 'stroke',
        display: 'inline-block'
      } as React.CSSProperties}
    >
      {text}
    </h2>
  );
};

export default GameTitle;