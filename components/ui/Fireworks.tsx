import React, { useEffect, useState } from 'react';

const COLORS = ['#FFC700', '#FF0000', '#22d3ee', '#00FF00', '#9D00FF'];

const Fireworks: React.FC = () => {
  // FIX: Replaced JSX.Element with React.ReactElement to avoid global namespace issue.
  const [fireworks, setFireworks] = useState<React.ReactElement[]>([]);

  useEffect(() => {
    const createFirework = (index: number) => {
      const fireworkStyle: React.CSSProperties = {
        left: `${Math.random() * 90 + 5}%`,
        bottom: 0,
        backgroundColor: COLORS[Math.floor(Math.random() * COLORS.length)],
        animationDelay: `${Math.random() * 2}s`,
      };

      const particles = Array.from({ length: 30 }).map((_, i) => {
        const angle = (i / 30) * 360;
        const radius = Math.random() * 80 + 20;
        const transformEnd = `translate(${Math.cos(angle * Math.PI / 180) * radius}px, ${Math.sin(angle * Math.PI / 180) * radius}px)`;
        
        const particleStyle: React.CSSProperties = {
          backgroundColor: fireworkStyle.backgroundColor,
          animationDelay: `${parseFloat(fireworkStyle.animationDelay || '0') + 1}s`,
          '--transform-end': transformEnd,
        } as React.CSSProperties;
        
        return <div key={i} className="particle" style={particleStyle}></div>;
      });

      return (
        <div key={index} className="firework" style={fireworkStyle}>
          {particles}
        </div>
      );
    };

    setFireworks(Array.from({ length: 8 }).map((_, i) => createFirework(i)));
  }, []);

  return <div className="fireworks-container">{fireworks}</div>;
};

export default Fireworks;