import React from 'react';
import Card from './ui/Card';
import LevelProgress from './ui/LevelProgress';

interface Recommendation {
    area: string;
    advice: string;
}

interface RecommendationsProps {
  intro: string;
  recs: Recommendation[];
  completedRecs: string[];
  onToggleRec: (advice: string) => void;
  levelInfo: {
    level: number;
    xp: number;
    xpToNextLevel: number;
  };
  isLoading: boolean;
}

const Recommendations: React.FC<RecommendationsProps> = ({ intro, recs, completedRecs, onToggleRec, levelInfo, isLoading }) => {
  return (
    <div>
        <h3 className="text-xl font-bold mb-4">Your AI Savings Plan</h3>
        <Card>
            {isLoading ? (
                <div className="space-y-4 p-4">
                    <div className="h-4 bg-slate-700 rounded w-3/4 animate-pulse"></div>
                    <div className="h-8 bg-slate-700 rounded w-full animate-pulse mt-4"></div>
                    <div className="h-8 bg-slate-700 rounded w-full animate-pulse"></div>
                    <div className="h-8 bg-slate-700 rounded w-full animate-pulse"></div>
                </div>
            ) : (
                <>
                    <p className="text-slate-300 mb-6">{intro}</p>
                    <div className="space-y-4">
                        {recs.map((rec, index) => {
                            const isCompleted = completedRecs.includes(rec.advice);
                            return (
                                <div key={index} className="flex items-center gap-4">
                                    <input
                                        type="checkbox"
                                        id={`rec-${index}`}
                                        checked={isCompleted}
                                        onChange={() => onToggleRec(rec.advice)}
                                        className="h-6 w-6 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-800 focus:ring-2 shrink-0 cursor-pointer"
                                        aria-label={`Mark recommendation as ${isCompleted ? 'incomplete' : 'complete'}`}
                                    />
                                    <label 
                                        htmlFor={`rec-${index}`}
                                        className={`flex-grow p-3 rounded-lg transition-all duration-300 cursor-pointer ${isCompleted ? 'bg-slate-800/50 text-slate-500 line-through' : 'bg-slate-900/50 ring-1 ring-slate-700 hover:ring-cyan-500'}`}
                                    >
                                        <span className={`font-bold ${isCompleted ? 'text-slate-600' : 'text-cyan-400'}`}>{rec.area}:</span>
                                        <span className="ml-2">{rec.advice}</span>
                                    </label>
                                </div>
                            );
                        })}
                    </div>
                    <LevelProgress 
                        level={levelInfo.level}
                        xp={levelInfo.xp}
                        xpToNextLevel={levelInfo.xpToNextLevel}
                    />
                </>
            )}
        </Card>
    </div>
  );
};

export default Recommendations;
