import React from 'react';
import Card from './ui/Card';

interface Recommendation {
    area: string;
    advice: string;
}

interface RecommendationsProps {
  intro: string;
  recs: Recommendation[];
  isLoading: boolean;
}

const Recommendations: React.FC<RecommendationsProps> = ({ intro, recs, isLoading }) => {
  return (
    <div>
        <h3 className="text-xl font-bold mb-4">Your AI Savings Plan</h3>
        <Card>
            {isLoading ? (
                <div className="space-y-4 p-4">
                    <div className="h-4 bg-slate-700 rounded w-3/4 animate-pulse"></div>
                    <div className="h-8 bg-slate-700 rounded w-full animate-pulse mt-4"></div>
                    <div className="h-8 bg-slate-700 rounded w-full animate-pulse"></div>
                </div>
            ) : (
                <>
                    <p className="text-slate-300 mb-4">{intro}</p>
                    <div className="space-y-3">
                        {recs.map((rec, index) => (
                            <div key={index} className="bg-slate-900/50 ring-1 ring-slate-700 p-3 rounded-lg flex items-center gap-4">
                                <span className="text-cyan-400 font-bold flex-shrink-0">{rec.area}:</span>
                                <span className="text-slate-200">{rec.advice}</span>
                            </div>
                        ))}
                    </div>
                </>
            )}
        </Card>
    </div>
  );
};

export default Recommendations;