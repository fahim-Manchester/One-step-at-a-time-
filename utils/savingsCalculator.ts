
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
  const initialDailySaving = 0.50; // Start with 50p

  // Using arithmetic progression formula: S = n/2 * (2a + (n-1)d)
  // S = targetAmount, n = totalDays, a = initialDailySaving
  // We solve for d (the daily increment)
  const n = totalDays;
  const S = targetAmount;
  const a = initialDailySaving;

  let d = 0;
  if (n > 1) {
    d = (2 * S / n - 2 * a) / (n - 1);
  }

  // Handle cases where the goal is too small for the duration, which might lead to negative increments.
  // In such cases, we just save an equal amount each day.
  if (d < 0) {
    const equalDailyAmount = S / n;
    d = 0; // reset increment
    let cumulative = 0;
    for (let i = 0; i < n; i++) {
        const currentDate = new Date(startDate);
        currentDate.setDate(startDate.getDate() + i);
        cumulative += equalDailyAmount;
        plan.push({
            day: i + 1,
            date: currentDate.toISOString(),
            dailyAmount: equalDailyAmount,
            cumulativeAmount: cumulative,
        });
    }
  } else {
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
  }


  // Adjust the last day's cumulative amount to exactly match the target due to potential floating point inaccuracies
  if (plan.length > 0) {
    plan[plan.length - 1].cumulativeAmount = targetAmount;
  }

  return plan;
};
