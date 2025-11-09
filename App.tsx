import React, { useState, useEffect } from 'react';
import GoalSetup from './components/GoalSetup';
import Dashboard from './components/Dashboard';
import BannedScreen from './components/BannedScreen';
import StarryBackground from './components/ui/StarryBackground';
import type { AppState, SavingsGoal } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState | null>(null);

  useEffect(() => {
    try {
      const savedState = localStorage.getItem('appState');
      if (savedState) {
        const parsedState: AppState = JSON.parse(savedState);
        // Re-hydrate date objects after parsing from JSON and add fallback for new state
        setAppState({
          ...parsedState,
          goal: {
            ...parsedState.goal,
            deadline: new Date(parsedState.goal.deadline),
          },
          currentDate: parsedState.currentDate || new Date().toISOString().split('T')[0],
          missedDaysStreak: parsedState.missedDaysStreak || 0,
          missedDays: parsedState.missedDays || [],
          isPenalized: parsedState.isPenalized || false,
        });
      }
    } catch (error) {
      console.error("Failed to load state from local storage:", error);
      localStorage.removeItem('appState');
    }
  }, []);

  const handleGoalSet = (goal: SavingsGoal) => {
    const newState: AppState = {
      goal,
      completedDays: 0,
      lastCompletionDate: null,
      currentDate: new Date().toISOString().split('T')[0],
      missedDaysStreak: 0,
      missedDays: [],
      isPenalized: false,
    };
    setAppState(newState);
    localStorage.setItem('appState', JSON.stringify(newState));
  };
  
  const handleProgressUpdate = () => {
    if (!appState) return;
    const newState = {
        ...appState,
        completedDays: appState.completedDays + 1,
        lastCompletionDate: appState.currentDate,
        missedDaysStreak: 0, // Reset streak on successful save
    };
    setAppState(newState);
    localStorage.setItem('appState', JSON.stringify(newState));
  };

  const handleNextDay = () => {
    if (!appState) return;
    const currentDateObj = new Date(appState.currentDate);
    currentDateObj.setDate(currentDateObj.getDate() + 1);
    const newState = {
      ...appState,
      currentDate: currentDateObj.toISOString().split('T')[0],
    };
    setAppState(newState);
    localStorage.setItem('appState', JSON.stringify(newState));
  };

  const handleMissDay = () => {
    if (!appState) return;
    const currentDateObj = new Date(appState.currentDate);
    currentDateObj.setDate(currentDateObj.getDate() + 1);
    const newState = {
      ...appState,
      missedDaysStreak: appState.missedDaysStreak + 1,
      missedDays: [...appState.missedDays, appState.currentDate],
      currentDate: currentDateObj.toISOString().split('T')[0],
    };
    setAppState(newState);
    localStorage.setItem('appState', JSON.stringify(newState));
  };

  const handleUnban = () => {
    if (!appState) return;
    const newState = {
      ...appState,
      missedDaysStreak: 0,
      isPenalized: true,
    };
    setAppState(newState);
    localStorage.setItem('appState', JSON.stringify(newState));
  };

  const handleReset = () => {
    setAppState(null);
    localStorage.removeItem('appState');
  };

  if (appState && appState.missedDaysStreak >= 3) {
    return <BannedScreen onUnban={handleUnban} />;
  }

  return (
    <div className="bg-slate-900 text-white min-h-screen font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8 relative">
      <StarryBackground />
      <header className="w-full max-w-5xl mb-8 text-center relative z-10">
        <div className="flex items-center justify-center gap-3">
          <svg xmlns="http://www.w.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-cyan-400"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a15 15 0 0 0 0 20 15 15 0 0 0 0-20"></path><path d="M2 12a15 15 0 0 0 20 0 15 15 0 0 0-20 0"></path></svg>
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-slate-100">
            Orbit
          </h1>
        </div>
        <p className="text-slate-400 mt-2">Small steps so your finances don't collide!</p>
      </header>
      <main className="w-full max-w-5xl relative z-10">
        {appState ? (
          <Dashboard
            appState={appState}
            onReset={handleReset}
            onProgressUpdate={handleProgressUpdate}
            onNextDay={handleNextDay}
            onMissDay={handleMissDay}
          />
        ) : (
          <GoalSetup onGoalSet={handleGoalSet} />
        )}
      </main>
      <footer className="text-center mt-12 text-slate-500 text-sm relative z-10">
        <p>Powered by React, Tailwind CSS, and Gemini</p>
      </footer>
    </div>
  );
};

export default App;