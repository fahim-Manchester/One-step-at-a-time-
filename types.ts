export enum AccuracyLevel {
  BASIC = 'basic',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

export interface BasicFinancials {
  monthlyIncome: number;
  monthlySpending: number;
}

export interface RecurringExpense {
  name: string;
  amount: number;
}

export interface IntermediateFinancials extends BasicFinancials {
  weeklyGroceries: number;
  recurringExpenses: RecurringExpense[];
}

export interface Transaction {
  date: string;
  description: string;
  amount: number;
}

export interface AdvancedFinancials {
  transactions: Transaction[];
}

export type Financials = BasicFinancials | IntermediateFinancials | AdvancedFinancials;

export interface SavingsGoal {
  targetAmount: number;
  deadline: Date;
  accuracyLevel: AccuracyLevel;
  financials: Financials;
}

export interface AppState {
  goal: SavingsGoal;
  completedDays: number;
  lastCompletionDate: string | null;
  currentDate: string;
}

export interface SavingsPlanEntry {
  day: number;
  date: string;
  dailyAmount: number;
  cumulativeAmount: number;
}