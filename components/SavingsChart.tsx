
import React from 'react';
import type { SavingsPlanEntry } from '../types';
import Card from './ui/Card';

// Add type definition for window.Recharts for TypeScript
declare global {
  interface Window {
    Recharts: any;
  }
}

interface SavingsChartProps {
  data: SavingsPlanEntry[];
  goalAmount: number;
  completedDays: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-700 p-3 border border-slate-600 rounded-md shadow-lg">
          <p className="label text-slate-300">{`Date: ${label}`}</p>
          <p className="intro text-cyan-400">{`Projected: £${payload[0].value.toFixed(2)}`}</p>
          <p className="text-xs text-slate-400 mt-1">{`Daily Goal: £${payload[0].payload.dailyAmount.toFixed(2)}`}</p>
        </div>
      );
    }
  
    return null;
};


const SavingsChart: React.FC<SavingsChartProps> = ({ data, goalAmount, completedDays }) => {
  if (typeof window === 'undefined' || !window.Recharts) {
    return (
      <Card className="w-full h-80 sm:h-96 p-4 pt-8 flex items-center justify-center">
        <p className="text-slate-400">Loading chart...</p>
      </Card>
    );
  }
  
  const { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } = window.Recharts;
  
  const progressDate = completedDays > 0 ? data[completedDays -1]?.date : undefined;

  return (
    <Card className="w-full h-80 sm:h-96 p-4 pt-8">
        <ResponsiveContainer width="100%" height="100%">
            <AreaChart
                data={data}
                margin={{
                    top: 5,
                    right: 20,
                    left: 10,
                    bottom: 5,
                }}
            >
                <defs>
                    <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 12 }} tickMargin={10} />
                <YAxis unit="£" tick={{ fill: '#94a3b8', fontSize: 12 }} tickMargin={5} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ color: '#e2e8f0' }} />
                <ReferenceLine y={goalAmount} label={{ value: `Goal £${goalAmount}`, position: 'insideTopRight', fill: '#f8fafc' }} stroke="#f43f5e" strokeDasharray="4 4" />
                {progressDate && <ReferenceLine x={progressDate} stroke="#facc15" strokeWidth={2} label={{ value: 'Your Progress', fill: '#facc15', position: 'insideTop' }} />}
                <Area type="monotone" dataKey="cumulativeAmount" name="Projected Savings" stroke="#22d3ee" fillOpacity={1} fill="url(#colorUv)" />
            </AreaChart>
        </ResponsiveContainer>
    </Card>
  );
};

export default SavingsChart;
