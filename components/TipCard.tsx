
import React from 'react';
import Card from './ui/Card';

interface TipCardProps {
  tip: string;
}

const LightbulbIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-300 h-6 w-6 mr-4 flex-shrink-0">
        <line x1="12" y1="2" x2="12" y2="6"></line>
        <line x1="12" y1="18" x2="12" y2="22"></line>
        <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line>
        <line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line>
        <line x1="2" y1="12" x2="6" y2="12"></line>
        <line x1="18" y1="12" x2="22" y2="12"></line>
        <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line>
        <line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line>
        <path d="M4 11a8 8 0 0 1 8-8c.32 0 .64.02.95.05A6 6 0 0 0 8 11a6 6 0 0 0 5 5.95c.03.31.05.63.05.95a8 8 0 0 1-8 8 7.91 7.91 0 0 1-4-1.09"></path>
    </svg>
)

const TipCard: React.FC<TipCardProps> = ({ tip }) => {
  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-lg p-4 flex items-center transition-transform duration-300 hover:scale-105 hover:border-cyan-500/50">
        <LightbulbIcon />
        <p className="text-slate-300 text-sm">{tip}</p>
    </div>
  );
};

export default TipCard;
