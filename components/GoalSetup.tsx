import React, { useState } from 'react';
import type { SavingsGoal, BasicFinancials, IntermediateFinancials, AdvancedFinancials, RecurringExpense } from '../types';
import { AccuracyLevel } from '../types';
import { parseCSV } from '../utils/csvParser';
import Button from './ui/Button';
import Card from './ui/Card';
import Input from './ui/Input';
import OrbitalAnimation from './ui/OrbitalAnimation';

interface GoalSetupProps {
  onGoalSet: (goal: SavingsGoal) => void;
}

const GoalSetup: React.FC<GoalSetupProps> = ({ onGoalSet }) => {
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');

  // Step 1 state
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  
  // Step 2 state
  const [accuracyLevel, setAccuracyLevel] = useState<AccuracyLevel | null>(null);

  // Step 3 state
  const [financials, setFinancials] = useState<any>({});
  const [fileName, setFileName] = useState('');

  const today = new Date();
  const minDate = new Date(today.setDate(today.getDate() + 2)).toISOString().split('T')[0];

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(targetAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid savings amount.');
      return;
    }
    if (!deadline || new Date(deadline) <= new Date()) {
      setError('Please select a future date for your deadline.');
      return;
    }
    setError('');
    setStep(2);
  };
  
  const handleLevelSelect = (level: AccuracyLevel) => {
    setAccuracyLevel(level);
    setStep(3);
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const text = event.target?.result as string;
          const transactions = parseCSV(text);
          if (transactions.length === 0) {
            setError("Could not parse transactions from file. Please check the format.");
            setFileName('');
          } else {
            setFinancials({ transactions });
            setError('');
          }
        } catch (err) {
            setError((err as Error).message);
            setFileName('');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accuracyLevel) {
        setError("Something went wrong, please restart.");
        return;
    }

    const finalGoal: SavingsGoal = {
        targetAmount: parseFloat(targetAmount),
        deadline: new Date(deadline),
        accuracyLevel: accuracyLevel,
        financials: financials as any, // Cast since we build it dynamically
    };
    onGoalSet(finalGoal);
  };

  const handleBack = () => {
    setError('');
    setStep(prev => Math.max(1, prev - 1));
  }
  
  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <form onSubmit={handleStep1Submit} className="space-y-6">
            <Input label="How much do you want to save? (£)" id="targetAmount" type="number" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="e.g., 100" min="1" step="0.01" required icon={<span className="font-bold">£</span>}/>
            <Input label="When do you need it by?" id="deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} min={minDate} required icon={<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>} />
            <Button type="submit" className="w-full">Next Step</Button>
          </form>
        );
      case 2:
        return (
            <>
                <div className="space-y-4">
                    <AccuracyCard level={AccuracyLevel.BASIC} title="Basic" description="Provide monthly income and spending estimates." onSelect={handleLevelSelect} />
                    <AccuracyCard level={AccuracyLevel.INTERMEDIATE} title="Try a bit more" description="Also include grocery spending and recurring bills." onSelect={handleLevelSelect} />
                    <AccuracyCard level={AccuracyLevel.ADVANCED} title="Lock in" description="Upload a transaction history (CSV) for detailed analysis." onSelect={handleLevelSelect} />
                </div>
                <div className="mt-6 text-center">
                    <Button onClick={handleBack} variant="ghost">Back</Button>
                </div>
            </>
        );
      case 3:
        return (
            <form onSubmit={handleFinalSubmit} className="space-y-4">
                {accuracyLevel === AccuracyLevel.BASIC && (
                    <>
                        <Input label="Monthly Income (£)" type="number" placeholder="2000" required onChange={e => setFinancials({ ...financials, monthlyIncome: parseFloat(e.target.value) })}/>
                        <Input label="Monthly Spending (£)" type="number" placeholder="1500" required onChange={e => setFinancials({ ...financials, monthlySpending: parseFloat(e.target.value) })}/>
                    </>
                )}
                {accuracyLevel === AccuracyLevel.INTERMEDIATE && (
                    <>
                        <Input label="Monthly Income (£)" type="number" placeholder="2000" required onChange={e => setFinancials({ ...financials, monthlyIncome: parseFloat(e.target.value) })}/>
                        <Input label="Monthly Spending (£)" type="number" placeholder="1500" required onChange={e => setFinancials({ ...financials, monthlySpending: parseFloat(e.target.value) })}/>
                        <Input label="Weekly Groceries (£)" type="number" placeholder="70" required onChange={e => setFinancials({ ...financials, weeklyGroceries: parseFloat(e.target.value) })}/>
                        <Input as="textarea" label="Recurring Expenses (name, amount per month)" placeholder={"Netflix, 10\nGym, 30"} required onChange={e => {
                            const expenses: RecurringExpense[] = e.target.value.split('\n').map(line => {
                                const [name, amount] = line.split(',');
                                return { name: name?.trim(), amount: parseFloat(amount) };
                            }).filter(exp => exp.name && !isNaN(exp.amount));
                            setFinancials({ ...financials, recurringExpenses: expenses });
                        }}/>
                    </>
                )}
                {accuracyLevel === AccuracyLevel.ADVANCED && (
                     <div>
                        <label htmlFor="csv-upload" className="block text-sm font-medium text-slate-400 mb-2">Upload Transaction History</label>
                        <label htmlFor="csv-upload" className="w-full bg-slate-700/50 border border-dashed border-slate-600 rounded-md py-6 text-slate-400 hover:border-cyan-500 hover:text-cyan-400 transition cursor-pointer flex flex-col items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
                            <span className="mt-2">{fileName || 'Click to upload a .csv file'}</span>
                        </label>
                        <input id="csv-upload" type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
                     </div>
                )}
                <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <Button type="button" onClick={handleBack} variant="secondary" className="w-full">Back</Button>
                    <Button type="submit" className="w-full" disabled={accuracyLevel === AccuracyLevel.ADVANCED && !financials.transactions}>Start Saving</Button>
                </div>
            </form>
        );
      default: return null;
    }
  };
  
  const stepTitles = ["Set Your Savings Goal", "Choose Your Plan's Accuracy", "Provide Financial Details"];
  const stepSubtitles = ["Let's start your journey to financial wellness.", "More detail provides better AI recommendations.", "This information helps create your custom plan."];

  return (
    <div className="animate-fade-in-up relative">
        <OrbitalAnimation />
        <Card className="max-w-md mx-auto relative z-10">
            <h2 className="text-2xl font-bold text-center text-slate-100 mb-2">{stepTitles[step-1]}</h2>
            <p className="text-center text-slate-400 mb-6">{stepSubtitles[step-1]}</p>
            {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}
            {renderStep()}
            <p className="text-center text-slate-500 text-xs mt-6">
              A consistent daily commitment is key. Missing your goal for three consecutive days will temporarily freeze your plan.
            </p>
        </Card>
    </div>
  );
};

const AccuracyCard = ({ level, title, description, onSelect }: {level: AccuracyLevel, title: string, description: string, onSelect: (level: AccuracyLevel) => void}) => (
    <button onClick={() => onSelect(level)} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg p-4 text-left hover:border-cyan-500 hover:bg-slate-700 transition duration-200">
        <h3 className="font-bold text-cyan-400">{title}</h3>
        <p className="text-sm text-slate-300">{description}</p>
    </button>
);

export default GoalSetup;