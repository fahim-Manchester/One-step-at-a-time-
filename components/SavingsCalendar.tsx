import React from 'react';
import Card from './ui/Card';

interface SavingsCalendarProps {
  startDate: string;
  totalDays: number;
  completedDays: number;
  missedDays: string[];
}

const SavingsCalendar: React.FC<SavingsCalendarProps> = ({ startDate, totalDays, completedDays, missedDays }) => {
  const start = new Date(startDate);
  start.setUTCHours(0,0,0,0);
  const startDayOfWeek = (start.getUTCDay() + 6) % 7; // Monday is 0, Sunday is 6

  const calendarDays = [];
  
  // Add spacer divs for days of the week before the start date
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarDays.push(<div key={`spacer-${i}`} className="border-r border-b border-slate-700"></div>);
  }

  const currentProgressIndex = completedDays + missedDays.length;

  for (let i = 0; i < totalDays; i++) {
    const dayNumber = i + 1;
    const currentDate = new Date(start);
    currentDate.setUTCDate(start.getUTCDate() + i);
    const currentDateString = currentDate.toISOString().split('T')[0];

    let dayContainerClasses = "flex items-center justify-center h-12 sm:h-14 border-r border-b border-slate-700 transition-colors duration-300";
    let dayTextClasses = "text-sm sm:text-base";

    const isCompleted = i < completedDays;
    const isToday = i === currentProgressIndex;
    const isMissed = missedDays.includes(currentDateString);

    if (isMissed) {
        dayContainerClasses += " bg-red-900/60";
        dayTextClasses += " text-red-400";
    } else if (isToday) {
      dayContainerClasses += " bg-cyan-900/50"; 
      dayTextClasses += " bg-cyan-500 text-white font-bold rounded-full w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center shadow-lg shadow-cyan-500/30";
    } else if (isCompleted) {
      dayContainerClasses += " bg-slate-800/50";
      dayTextClasses += " text-slate-600 line-through";
    } else {
      dayTextClasses += " text-slate-300";
    }
    
    calendarDays.push(
      <div key={dayNumber} className={dayContainerClasses}>
        <span className={dayTextClasses}>{dayNumber}</span>
      </div>
    );
  }

  const currentWeek = Math.floor(currentProgressIndex / 7) + 1;
  const totalWeeks = Math.ceil(totalDays / 7);

  return (
    <Card className="w-full p-4 sm:p-6 animate-fade-in">
      <h3 className="text-center text-lg font-bold text-slate-200 mb-4">Your Savings Calendar</h3>
      <div className="grid grid-cols-7 text-center text-xs text-slate-400 mb-2 font-semibold">
        <div>Mon</div>
        <div>Tue</div>
        <div>Wed</div>
        <div>Thu</div>
        <div>Fri</div>
        <div>Sat</div>
        <div>Sun</div>
      </div>
      <div className="grid grid-cols-7 border-t border-l border-slate-700 bg-slate-900/50 rounded-b-lg overflow-hidden">
        {calendarDays}
      </div>
      <div className="mt-6 text-center bg-slate-900/50 rounded-lg p-4">
        <p className="text-slate-400 uppercase tracking-wider text-sm">Current Week</p>
        <p className="text-3xl font-bold text-cyan-400 mt-1">
            Week {currentWeek} <span className="text-xl text-slate-500">/ {totalWeeks}</span>
        </p>
      </div>
    </Card>
  );
};

export default SavingsCalendar;