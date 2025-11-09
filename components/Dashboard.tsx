import React, { useMemo, useState, useEffect, useRef } from 'react';
import type { AppState, SavingsGoal, BasicFinancials, AdvancedFinancials } from '../types';
import { AccuracyLevel } from '../types';
import { generateSavingsPlan } from '../utils/savingsCalculator';
import { getRecommendations } from '../services/geminiService';
import SavingsChart from './SavingsChart';
import Recommendations from './Recommendations';
import Card from './ui/Card';
import Button from './ui/Button';

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

const calculateCurrentWeeklySpending = (goal: SavingsGoal): number => {
    const { financials, accuracyLevel } = goal;
    switch (accuracyLevel) {
      case AccuracyLevel.ADVANCED: {
        const f = financials as AdvancedFinancials;
        if (!f.transactions || f.transactions.length === 0) return 0;
        try {
            const dates = f.transactions.map(t => new Date(t.date)).sort((a, b) => a.getTime() - b.getTime());
            const firstDate = dates[0];
            const lastDate = dates[dates.length - 1];
            if (isNaN(firstDate.getTime()) || isNaN(lastDate.getTime())) return 0;
            const diffTime = Math.abs(lastDate.getTime() - firstDate.getTime());
            const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
            const totalWeeks = diffDays / 7;
            const totalSpending = f.transactions.reduce((sum, t) => sum + t.amount, 0);
            return totalWeeks > 1 ? totalSpending / totalWeeks : totalSpending;
        } catch (e) {
            console.error("Could not parse dates from CSV for weekly spending calculation.", e);
            return 0;
        }
      }
      case AccuracyLevel.INTERMEDIATE:
      case AccuracyLevel.BASIC:
      default: {
        const bf = financials as BasicFinancials;
        return bf.monthlySpending ? bf.monthlySpending / (365.25 / 12 / 7) : 0;
      }
    }
  }


const Dashboard: React.FC<DashboardProps> = ({ appState, onReset, onProgressUpdate, onNextDay, onMissDay }) => {
  const { goal, completedDays, lastCompletionDate, currentDate, missedDays, isPenalized } = appState;

  const [recommendationData, setRecommendationData] = useState<RecommendationData | null>(null);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);

  // State for new interactive recommendations
  const [completedRecs, setCompletedRecs] = useState<string[]>([]);
  const XP_PER_REC = 10;
  const XP_FOR_LEVEL_UP = 30; // 3 recs to level up
  const [levelInfo, setLevelInfo] = useState({
    level: 1,
    xp: 0,
    xpToNextLevel: XP_FOR_LEVEL_UP
  });

  const currentWeek = useMemo(() => Math.floor(completedDays / 7) + 1, [completedDays]);
  const prevWeekRef = useRef(currentWeek);
  const hasRunInitialEffect = useRef(false);

  useEffect(() => {
      const isNewWeek = prevWeekRef.current !== currentWeek;
      
      if (!hasRunInitialEffect.current || isNewWeek) {
          const fetchAndSetRecs = async () => {
              setIsLoadingRecs(true);
              // Pass the current state of completedRecs from the *previous* week to get new ideas
              const data = await getRecommendations(goal, completedRecs, currentWeek);
              setRecommendationData(data);
              if (isNewWeek) {
                  setCompletedRecs([]); // Reset for the new week
              }
              prevWeekRef.current = currentWeek;
              hasRunInitialEffect.current = true;
              setIsLoadingRecs(false);
          };

          fetchAndSetRecs();
      }
  }, [currentWeek, goal]); // This effect correctly runs only on week change or initial goal set

  const handleToggleRec = (advice: string) => {
    const isAlreadyCompleted = completedRecs.includes(advice);
    
    setCompletedRecs(prev => 
        isAlreadyCompleted 
            ? prev.filter(item => item !== advice)
            : [...prev, advice]
    );

    setLevelInfo(prev => {
        const newXp = prev.xp + (isAlreadyCompleted ? -XP_PER_REC : XP_PER_REC);
        
        if (newXp >= prev.xpToNextLevel) {
            return {
                level: prev.level + 1,
                xp: newXp - prev.xpToNextLevel,
                xpToNextLevel: XP_FOR_LEVEL_UP,
            };
        }
        
        if (newXp < 0) {
             return {
                level: Math.max(1, prev.level - 1),
                xp: prev.xpToNextLevel + newXp,
                xpToNextLevel: XP_FOR_LEVEL_UP,
            };
        }

        return { ...prev, xp: newXp };
    });
  };

  const savingsPlan = useMemo(() => generateSavingsPlan(goal), [goal]);

  const isTodaySaved = lastCompletionDate === currentDate;

  const todaysPlanEntry = savingsPlan[completedDays] || null;
  const currentSavedAmount = savingsPlan[completedDays - 1]?.cumulativeAmount || 0;
  const progress = (currentSavedAmount / goal.targetAmount) * 100;
  const daysLeft = Math.max(0, savingsPlan.length - completedDays);
  
  const currentWeeklySpending = useMemo(() => calculateCurrentWeeklySpending(goal), [goal]);
  const newWeeklySpendTarget = recommendationData ? currentWeeklySpending - recommendationData.weeklySpendingReductionTarget : null;


  const handleSaveToday = () => {
    if (!isTodaySaved) {
      onProgressUpdate();
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
        <div className="flex flex-col sm:flex-row gap-4">
            <Card className="flex-1 p-4">
                <h2 className="text-lg font-bold text-slate-200">{isTodaySaved ? 'Tomorrow\'s Goal' : 'Today\'s Goal'}</h2>
                <p className="text-4xl font-bold text-cyan-400 mt-2">£{todaysPlanEntry ? todaysPlanEntry.dailyAmount.toFixed(2) : '0.00'}</p>
                <p className="text-sm text-slate-400">{todaysPlanEntry ? 'Transfer this to your savings.' : 'You have reached your goal!'}</p>
            </Card>
            {isPenalized ? (
                <Card className="flex-1 p-4 flex flex-col justify-center items-center bg-red-900/50 border-red-700">
                    <p className="text-red-300 font-semibold text-center">Your streak was broken.</p>
                    <p className="text-slate-400 text-sm text-center mt-1">You must start a new goal to continue.</p>
                </Card>
            ) : (
                <Card className="flex-1 p-4 flex flex-col justify-center items-center">
                    <Button onClick={handleSaveToday} disabled={isTodaySaved || !todaysPlanEntry} className="w-full h-full text-lg">
                        {isTodaySaved ? "All Saved for Today!" : "I've Saved Today"}
                    </Button>
                </Card>
            )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Target Goal" value={goal.targetAmount.toFixed(2)} currency="£" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>} />
            <StatCard title="Actually Saved" value={currentSavedAmount.toFixed(2)} currency="£" icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6"></path><path d="m12 12 4 10 1.7-4.3L22 16Z"></path></svg>} />
            <StatCard 
                title="Weekly Spend" 
                value={isLoadingRecs ? '...' : (newWeeklySpendTarget !== null && newWeeklySpendTarget > 0 ? newWeeklySpendTarget.toFixed(2) : 'N/A')} 
                currency={!isLoadingRecs && newWeeklySpendTarget !== null && newWeeklySpendTarget > 0 ? "£" : undefined}
                icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>}
            />
            <StatCard title="Days Left" value={String(daysLeft)} icon={<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>} />
        </div>

        <Card>
            <div className="flex justify-between items-start">
                <div>
                    <h2 className="text-2xl font-bold">Your Progress</h2>
                    <p className="text-slate-400">Saving £{goal.targetAmount.toFixed(2)} by {goal.deadline.toLocaleDateString('en-GB')}</p>
                </div>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-2.5 mt-4">
                <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${Math.min(progress, 100)}%` }}></div>
            </div>
            <p className="text-right text-sm mt-2 text-slate-300">{progress.toFixed(1)}% Complete</p>
        </Card>

        <SavingsChart data={savingsPlan} goalAmount={goal.targetAmount} completedDays={completedDays} missedDays={missedDays} />
        
        <Recommendations 
            isLoading={isLoadingRecs}
            intro={recommendationData?.intro || ''}
            recs={recommendationData?.recommendations || []}
            completedRecs={completedRecs}
            onToggleRec={handleToggleRec}
            levelInfo={levelInfo}
        />

        <Card className="text-center p-4">
            <h3 className="text-lg font-semibold text-slate-300">Time Control</h3>
            <p className="text-slate-400 mb-4">Current Date: <span className="font-mono text-cyan-400">{new Date(currentDate).toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span></p>
            <div className="flex gap-4 justify-center">
                <Button onClick={onMissDay} variant="secondary" disabled={isTodaySaved || isPenalized}>
                    Miss a Day
                </Button>
                <Button onClick={onNextDay} variant="secondary" disabled={!isTodaySaved || isPenalized}>
                    Simulate Next Day →
                </Button>
            </div>
            <p className="text-xs text-slate-500 mt-2">
                {isPenalized
                    ? "Controls are locked. Please start a new goal."
                    : 'Press "I\'ve Saved Today" before advancing to the next day.'
                }
            </p>
        </Card>

        <div className="text-center pt-4">
            <Button onClick={onReset} variant="ghost">Start a New Goal</Button>
        </div>
    </div>
  );
};

export default Dashboard;