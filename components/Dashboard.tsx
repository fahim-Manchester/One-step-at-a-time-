import React, { useMemo, useState, useEffect } from 'react';
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
}

const StatCard: React.FC<{ title: string; value: string; currency?: string;}> = ({ title, value, currency }) => (
    <Card className="text-center p-4">
        <p className="text-sm text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold text-cyan-400 mt-1">
            {currency && <span className="text-2xl align-baseline">{currency}</span>}
            {value}
        </p>
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


const Dashboard: React.FC<DashboardProps> = ({ appState, onReset, onProgressUpdate, onNextDay }) => {
  const { goal, completedDays, lastCompletionDate, currentDate } = appState;

  const [recommendationData, setRecommendationData] = useState<RecommendationData | null>(null);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);

  useEffect(() => {
    const fetchRecs = async () => {
      setIsLoadingRecs(true);
      const data = await getRecommendations(goal);
      setRecommendationData(data);
      setIsLoadingRecs(false);
    };
    fetchRecs();
  }, [goal]);

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
            <Card className="flex-1 p-4 flex flex-col justify-center items-center">
                 <Button onClick={handleSaveToday} disabled={isTodaySaved || !todaysPlanEntry} className="w-full h-full text-lg">
                    {isTodaySaved ? "All Saved for Today!" : "I've Saved Today"}
                 </Button>
            </Card>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard title="Target Goal" value={goal.targetAmount.toFixed(2)} currency="£" />
            <StatCard title="Actually Saved" value={currentSavedAmount.toFixed(2)} currency="£" />
            <StatCard 
                title="New Weekly Spend Target" 
                value={isLoadingRecs ? '...' : (newWeeklySpendTarget !== null && newWeeklySpendTarget > 0 ? newWeeklySpendTarget.toFixed(2) : 'N/A')} 
                currency={!isLoadingRecs && newWeeklySpendTarget !== null && newWeeklySpendTarget > 0 ? "£" : undefined} 
            />
            <StatCard title="Days Left" value={String(daysLeft)} />
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

        <SavingsChart data={savingsPlan} goalAmount={goal.targetAmount} completedDays={completedDays} />
        
        <Recommendations 
            isLoading={isLoadingRecs}
            intro={recommendationData?.intro || ''}
            recs={recommendationData?.recommendations || []}
        />

        <Card className="text-center p-4">
            <h3 className="text-lg font-semibold text-slate-300">Time Control</h3>
            <p className="text-slate-400 mb-4">Current Date: <span className="font-mono text-cyan-400">{new Date(currentDate).toLocaleDateString('en-GB', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span></p>
            <Button onClick={onNextDay} variant="secondary" disabled={!isTodaySaved}>
                Simulate Next Day →
            </Button>
            <p className="text-xs text-slate-500 mt-2">Press "I've Saved Today" before advancing to the next day.</p>
        </Card>

        <div className="text-center pt-4">
            <Button onClick={onReset} variant="ghost">Start a New Goal</Button>
        </div>
    </div>
  );
};

export default Dashboard;