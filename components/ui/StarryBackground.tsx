import React from 'react';

const StarryBackground: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full z-0">
      {/* Nebula */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/10 rounded-full blur-3xl opacity-50"></div>

      {/* Stars Layer 1 (Smallest, Fastest) */}
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
              animation: 'move-stars-bg 150s linear infinite',
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
              animation: 'move-stars-bg 200s linear infinite',
          }}
      ></div>
      
      {/* Stars Layer 3 (Largest, Slowest) */}
      <div
          className="absolute top-0 left-0 w-[2560px] h-[2560px] bg-repeat"
          style={{
              backgroundImage: `
                  radial-gradient(2px 2px at 30% 70%, white, transparent),
                  radial-gradient(2px 2px at 80% 25%, white, transparent)
              `,
              backgroundSize: '1024px 1024px',
              animation: 'move-stars-bg 250s linear infinite',
          }}
      ></div>
    </div>
  );
};

export default StarryBackground;