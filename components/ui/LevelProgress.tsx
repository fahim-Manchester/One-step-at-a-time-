import React from 'react';

interface LevelProgressProps {
  level: number;
  xp: number;
  xpToNextLevel: number;
}

const LevelProgress: React.FC<LevelProgressProps> = ({ level, xp, xpToNextLevel }) => {
  const progressPercentage = (xp / xpToNextLevel) * 100;

  return (
    <div className="mt-6 border-t border-slate-700 pt-4">
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-cyan-400">Level {level}</span>
        <span className="text-sm text-slate-400">{xp} / {xpToNextLevel} XP</span>
      </div>
      <div className="w-full bg-slate-700 rounded-full h-2.5">
        <div 
          className="bg-cyan-500 h-2.5 rounded-full transition-all duration-500" 
          style={{ width: `${progressPercentage}%` }}
          aria-valuenow={progressPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          role="progressbar"
          aria-label={`Level ${level} progress`}
        ></div>
      </div>
    </div>
  );
};

export default LevelProgress;
