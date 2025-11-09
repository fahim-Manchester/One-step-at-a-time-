import React from 'react';

const HeatDeathBackground: React.FC = () => {
  return (
    <div
      className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden"
      style={{ animation: 'screen-shake 0.5s ease-in-out forwards' }}
    >
      {/* Stars Layer 1 (Smallest) */}
      <div
          className="absolute top-0 left-0 w-[2560px] h-[2560px] bg-repeat"
          style={{
              backgroundImage: `
                  radial-gradient(1px 1px at 20% 30%, white, transparent),
                  radial-gradient(1px 1px at 80% 60%, white, transparent),
                  radial-gradient(1px 1px at 50% 10%, white, transparent),
                  radial-gradient(1px 1px at 95% 45%, white, transparent),
                  radial-gradient(1px 1px at 40% 85%, white, transparent)
              `,
              backgroundSize: '256px 256px',
              animation: 'stars-fade-after-flash 4s ease-in forwards 2s',
          }}
      ></div>

      {/* Stars Layer 2 (Medium) */}
      <div
          className="absolute top-0 left-0 w-[2560px] h-[2560px] bg-repeat"
          style={{
              backgroundImage: `
                  radial-gradient(1.5px 1.5px at 10% 20%, white, transparent),
                  radial-gradient(1.5px 1.5px at 70% 80%, white, transparent),
                  radial-gradient(1.5px 1.5px at 40% 50%, white, transparent)
              `,
              backgroundSize: '512px 512px',
              animation: 'stars-fade-after-flash 4s ease-in forwards 2s',
          }}
      ></div>
      
      {/* Stars Layer 3 (Largest) */}
      <div
          className="absolute top-0 left-0 w-[2560px] h-[2560px] bg-repeat"
          style={{
              backgroundImage: `
                  radial-gradient(2px 2px at 30% 70%, white, transparent),
                  radial-gradient(2px 2px at 80% 25%, white, transparent)
              `,
              backgroundSize: '1024px 1024px',
              animation: 'stars-fade-after-flash 4s ease-in forwards 2s',
          }}
      ></div>

      {/* Slower, more intimidating fiery flash */}
      <div 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150vmax] h-[150vmax] rounded-full"
        style={{
          backgroundImage: 'radial-gradient(circle, rgba(255,255,220,0.9) 0%, rgba(255,200,0,0.8) 25%, rgba(255,100,0,0.7) 50%, rgba(210,0,0,0.5) 75%, transparent 90%)',
          filter: 'blur(60px)',
          animation: 'intimidating-flash 5s ease-in-out forwards 0.2s',
        }}
      ></div>
    </div>
  );
};

export default HeatDeathBackground;