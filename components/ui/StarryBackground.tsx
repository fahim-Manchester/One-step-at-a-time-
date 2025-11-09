import React from 'react';

const StarryBackground: React.FC = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden">
      <div className="absolute bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] top-0 left-0 w-full h-[4000px] opacity-30" style={{ animation: 'move-stars 150s linear infinite' }}></div>
      <div className="absolute bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] top-0 left-0 w-full h-[4000px] opacity-20" style={{ animation: 'move-stars 100s linear infinite' }}></div>
    </div>
  );
};

export default StarryBackground;
