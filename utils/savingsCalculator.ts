
import type { SavingsGoal, SavingsPlanEntry } from '../types';

export const generateSavingsPlan = (goal: SavingsGoal): SavingsPlanEntry[] => {
  const { targetAmount, deadline } = goal;
  const startDate = new Date();
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(deadline);
  endDate.setHours(0, 0, 0, 0);

  const diffTime = endDate.getTime() - startDate.getTime();
  const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

  const plan: SavingsPlanEntry[] = [];
  const n = totalDays;
  const S = targetAmount;

  if (n <= 0) {
    return [];
  }
  
  if (n === 1) {
    plan.push({
      day: 1,
      date: startDate.toISOString(),
      dailyAmount: S,
      cumulativeAmount: S,
    });
    return plan;
  }

  const averageDailyAmount = S / n;
  
  // Start at 50% of the average daily amount, with a minimum of 1p.
  // This ensures the starting point is always manageable and relative to the goal.
  const a = Math.max(0.01, averageDailyAmount * 0.5);

  // Using arithmetic progression formula to find the daily increment 'd':
  // S = n/2 * (2a + (n-1)d)
  // This is guaranteed to be positive since 'a' is <= 'averageDailyAmount'
  const d = (2 * S / n - 2 * a) / (n - 1);

  let cumulativeAmount = 0;
  for (let i = 0; i < n; i++) {
    const dailyAmount = a + i * d;
    cumulativeAmount += dailyAmount;
    const currentDate = new Date(startDate);
    currentDate.setDate(startDate.getDate() + i);
    plan.push({
      day: i + 1,
      date: currentDate.toISOString(),
      dailyAmount: dailyAmount,
      cumulativeAmount: cumulativeAmount,
    });
  }

  // Adjust the last day's cumulative amount to exactly match the target 
  // due to potential floating point inaccuracies.
  if (plan.length > 0) {
    plan[plan.length - 1].cumulativeAmount = targetAmount;
  }

  return plan;
};
