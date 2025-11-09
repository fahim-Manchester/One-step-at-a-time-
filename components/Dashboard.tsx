import React, { useMemo, useState, useEffect, useRef } from 'react';
import type { AppState, SavingsGoal, BasicFinancials, AdvancedFinancials } from '../types';
import { AccuracyLevel } from '../types';
import { generateSavingsPlan } from '../utils/savingsCalculator';
import { getRecommendations } from '../services/geminiService';
import SavingsChart from './SavingsChart';
import Recommendations from './Recommendations';
import Card from './ui/Card';
import Button from './ui/Button';
import Fireworks from './ui/Fireworks';

import { CalendarIcon, CoinIcon, PiggyBankIcon, TargetIcon } from '../icons';

interface DashboardProps {
  appState: AppState;
  onReset: () => void;
  onProgressUpdate: () => void;
  onNextDay: () => void;
  onMissDay: () => void;
}

const StatCard: React.FC<{ title: string; value: string; currency?: string; icon: React.ReactNode; }> = ({ title, value, currency, icon }) => (
    <Card className="p-4">
        <div className="flex items-center gap-4">
            <div className="bg-slate-700/50 p-3 rounded-lg text-cyan-400">
                {icon}
            </div>
            <div>
                <p className="text-sm text-slate-400 uppercase tracking-wider">{title}</p>
                <p className="text-2xl font-bold text-slate-100 mt-1">
                    {currency && <span className="text-xl align-baseline">{currency}</span>}
                    {value}
                </p>
            </div>
        </div>
    </Card>
);

interface RecommendationData {
  intro: string;
  recommendations: { area: string; advice: string; }[];
  weeklySpendingReductionTarget: number;
}

// Base64 encoded fireworks sound
const FIREWORKS_SOUND = 'data:audio/mpeg;base64,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';

const Dashboard: React.FC<DashboardProps> = ({ appState, onReset, onProgressUpdate, onNextDay, onMissDay }) => {
  const { goal, completedDays, lastCompletionDate, currentDate, missedDays, isPenalized } = appState;
  const savingsPlan = useMemo(() => generateSavingsPlan(goal), [goal]);
  
  const [recommendationData, setRecommendationData] = useState<RecommendationData | null>(null);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);
  const [completedRecs, setCompletedRecs] = useState<string[]>([]);
  const [showFireworks, setShowFireworks] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  const currentProgressIndex = completedDays + missedDays.length;
  const currentWeek = Math.floor(currentProgressIndex / 7) + 1;
  const lastRecFetchWeekRef = useRef<number>(0);

  useEffect(() => {
      // Fetch new recommendations only if the week has changed.
      if (currentWeek !== lastRecFetchWeekRef.current) {
        setIsLoadingRecs(true);
        getRecommendations(goal, completedRecs, currentWeek)
          .then(data => {
            setRecommendationData(data);
            setIsLoadingRecs(false);
            lastRecFetchWeekRef.current = currentWeek;
          });
      }
  }, [goal, currentWeek]); // Dependency on currentWeek triggers the check.

  const handleToggleRec = (advice: string) => {
    setCompletedRecs(prev =>
      prev.includes(advice) ? prev.filter(a => a !== advice) : [...prev, advice]
    );
  };

  const handleSaveToday = () => {
    onProgressUpdate();
    setShowFireworks(true);
    audioRef.current?.play();
    setTimeout(() => setShowFireworks(false), 4000); // Hide fireworks after 4 seconds
  };
  
  const dailyGoal = savingsPlan[completedDays]?.dailyAmount || 0;
  const totalSaved = savingsPlan[completedDays - 1]?.cumulativeAmount || 0;
  
  const daysLeft = savingsPlan.length - completedDays;

  const isCompletedToday = lastCompletionDate === currentDate;
  
  const level = Math.floor(completedRecs.length / 3) + 1;
  const xp = completedRecs.length % 3;
  const xpToNextLevel = 3;

  return (
    <div className="space-y-8 animate-fade-in-up">
      {showFireworks && <Fireworks />}
      <audio ref={audioRef} src={FIREWORKS_SOUND} preload="auto" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Savings Goal" value={goal.targetAmount.toFixed(2)} currency="£" icon={<TargetIcon />} />
        <StatCard title="Saved So Far" value={totalSaved.toFixed(2)} currency="£" icon={<PiggyBankIcon />} />
        <StatCard title="Today's Goal" value={dailyGoal.toFixed(2)} currency="£" icon={<CoinIcon />} />
        <StatCard title="Days Left" value={daysLeft.toString()} icon={<CalendarIcon />} />
      </div>

      <SavingsChart data={savingsPlan} goalAmount={goal.targetAmount} completedDays={completedDays} missedDays={missedDays} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
            <Recommendations
                intro={recommendationData?.intro || ''}
                recs={recommendationData?.recommendations || []}
                completedRecs={completedRecs}
                onToggleRec={handleToggleRec}
                levelInfo={{ level, xp, xpToNextLevel }}
                isLoading={isLoadingRecs}
            />
        </div>
        <div className="space-y-6">
          <Card>
            <h3 className="text-xl font-bold mb-4">Daily Progress</h3>
            {isPenalized ? (
                <div className="text-center p-4 bg-slate-900/50 rounded-lg">
                    <p className="text-amber-400 font-semibold">Your plan is locked.</p>
                    <p className="text-slate-400 mt-2">To continue, you must commit to a new savings goal.</p>
                </div>
            ) : (
                <Button onClick={handleSaveToday} disabled={isCompletedToday || dailyGoal <= 0} className="w-full">
                {isCompletedToday ? "All Saved for Today!" : `I've Saved Today (£${dailyGoal.toFixed(2)})`}
                </Button>
            )}
          </Card>
          <Card>
            <h3 className="text-xl font-bold mb-2">Time Control</h3>
            <p className="text-slate-400 mb-4 text-sm">Use these to simulate your progress. <span className="text-slate-500 italic">Remember, 3 consecutive missed days freezes your plan.</span></p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button onClick={onMissDay} variant="secondary" className="w-full" disabled={isCompletedToday || isPenalized}>Miss a Day</Button>
              <Button onClick={onNextDay} variant="secondary" className="w-full" disabled={!isCompletedToday || isPenalized}>Simulate Next Day</Button>
            </div>
          </Card>
           <Card>
            <h3 className="text-xl font-bold mb-2">Start Over</h3>
            <p className="text-slate-400 mb-4 text-sm">This will erase your current goal and all progress.</p>
            <Button onClick={onReset} variant="ghost" className="w-full border border-red-500/50 text-red-400 hover:bg-red-500/20">
              Start a New Goal
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
