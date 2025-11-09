import React, { useState, useEffect } from 'react';
import Card from './ui/Card';

interface BannedScreenProps {
  onUnban: () => void;
}

const BannedScreen: React.FC<BannedScreenProps> = ({ onUnban }) => {
  const [inputValue, setInputValue] = useState('');
  const [position, setPosition] = useState({ top: '50%', left: '50%' });

  useEffect(() => {
    // Automatically open the video in a new tab when the component mounts
    window.open('https://www.youtube.com/watch?v=CRSXTPAJpTI', '_blank');
  }, []);

  useEffect(() => {
    // Set an interval to change the input's position
    const interval = setInterval(() => {
      // Generate random positions within the bounds of the card
      const newTop = Math.random() * 85 + 5; // 5% to 90%
      const newLeft = Math.random() * 85 + 5; // 5% to 90%
      setPosition({ top: `${newTop}%`, left: `${newLeft}%` });
    }, 800); // Move every 0.8 seconds

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Case-insensitive check for the password
    if (inputValue.toLowerCase() === 'broke') {
      onUnban();
    }
  }, [inputValue, onUnban]);

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans flex flex-col items-center justify-center p-4">
      <Card className="max-w-xl w-full text-center animate-fade-in-up relative overflow-hidden p-6 flex flex-col justify-center items-center min-h-[350px]">
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-red-500 mb-4"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <h1 className="text-3xl font-bold text-red-400">Streak Broken!</h1>
          <p className="text-slate-300 mt-4 text-lg">
            You missed 3 days, you're banned until you pay your unfreeze fee (don't worry it will go to charity).
          </p>
        
        {/* Moving password input */}
        <input
          type="password"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Your Savings 🥹"
          className="absolute z-10 bg-slate-700 border border-slate-600 rounded-md py-2 px-3 text-white placeholder-slate-400 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-500 ease-in-out w-44 shadow-lg"
          style={{
            top: position.top,
            left: position.left,
            transform: 'translate(-50%, -50%)', // Center the input on its position
          }}
          aria-label="Enter secret phrase to unban"
        />
      </Card>
    </div>
  );
};

export default BannedScreen;