import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Goal, CATEGORY_COLORS, GoalCategory } from '../types';

interface DashboardChartsProps {
  goals: Goal[];
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({ goals }) => {
  // Calculate aggregate stats
  // For 'AVOID' category, we treat logs as negative points (deductions)
  const positiveLogs = goals.filter(g => g.category !== GoalCategory.AVOID).reduce((acc, g) => acc + g.logs.length, 0);
  const negativeLogs = goals.filter(g => g.category === GoalCategory.AVOID).reduce((acc, g) => acc + g.logs.length, 0);
  
  const totalScore = positiveLogs - negativeLogs;
  
  // Calculate completion rate only for goals that have a target (excluding Avoid category for completion logic usually, 
  // but if Avoid has a target (limit), current logic divides current/target. 
  // Let's keep completion logic simple: Avoid goals usually shouldn't progress towards 100%, 
  // but for now we exclude them from "Completion" % to avoid skewing positive progress.
  const goalsWithTarget = goals.filter(g => g.targetCount && g.targetCount > 0 && g.category !== GoalCategory.AVOID);
  
  const totalProgress = goalsWithTarget.reduce((acc, g) => {
    const p = Math.min((g.currentCount / (g.targetCount || 1)), 1);
    return acc + p;
  }, 0);
  
  // Average % completion across targeted goals
  const displayPercentage = goalsWithTarget.length > 0 
    ? Math.round((totalProgress / goalsWithTarget.length) * 100) 
    : 0;

  const categoryData = Object.values(GoalCategory).map(cat => {
    return {
      name: cat,
      value: goals.filter(g => g.category === cat).reduce((acc, g) => acc + g.logs.length, 0), 
      color: CATEGORY_COLORS[cat]
    };
  }).filter(d => d.value > 0);

  return (
    <div className="space-y-4">
      {/* Overview Card */}
      <div className="bg-orange-500 rounded-3xl p-6 shadow-xl shadow-orange-900/20 relative overflow-hidden border-2 border-orange-400/50 group hover:scale-[1.02] transition-transform duration-300">
        {/* Decorative elements for planner feel */}
        <div className="absolute top-0 right-0 -mr-6 -mt-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
        <div className="absolute bottom-0 left-0 -ml-6 -mb-6 w-24 h-24 bg-black/10 rounded-full blur-xl"></div>
        
        <div className="relative z-10 flex justify-between items-start">
            <div>
              <p className="text-slate-900/60 font-black text-xs uppercase tracking-widest mb-1">Net Score</p>
              <div className="flex items-baseline gap-2">
                  <h2 className="text-6xl font-black text-slate-900 tracking-tighter">{totalScore}</h2>
                  {negativeLogs > 0 && (
                      <span className="text-red-800 font-bold text-sm bg-red-500/20 px-2 py-1 rounded">- {negativeLogs} penalty</span>
                  )}
              </div>
              <div className="mt-4 flex items-center gap-2">
                 <span className="bg-slate-900/10 px-3 py-1 rounded-md text-slate-900 font-bold text-[10px] uppercase tracking-wider border border-slate-900/10 backdrop-blur-sm">
                    {new Date().getFullYear()} Active
                 </span>
              </div>
            </div>
            <div className="text-right flex flex-col items-end">
                <div className="bg-white/20 p-3 rounded-2xl mb-2 text-slate-900 backdrop-blur-md shadow-sm transform rotate-3">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path></svg>
                </div>
                {goalsWithTarget.length > 0 && (
                    <div className="text-slate-900 font-bold">
                        <span className="text-2xl tracking-tight">{displayPercentage}%</span>
                        <div className="text-[10px] uppercase opacity-60 font-black">Positive Progress</div>
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Category Distribution */}
      <div className="bg-zinc-800 rounded-3xl p-6 border-2 border-zinc-700/50 shadow-lg relative overflow-hidden">
        {/* Binder ring holes visual decoration */}
        <div className="absolute top-0 left-6 w-16 h-4 bg-zinc-900/50 rounded-b-lg border-x border-b border-zinc-700/50"></div>
        <div className="absolute top-0 right-6 w-16 h-4 bg-zinc-900/50 rounded-b-lg border-x border-b border-zinc-700/50"></div>

        <div className="flex justify-between items-center mb-6 mt-2">
             <h3 className="text-white font-bold text-lg tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-6 bg-orange-500 rounded-full"></span>
                Focus Areas
             </h3>
        </div>
        
        <div className="flex flex-row items-center gap-6">
            <div className="h-32 w-32 shrink-0 relative">
              {categoryData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={30}
                      outerRadius={50}
                      paddingAngle={8}
                      dataKey="value"
                      stroke="none"
                      cornerRadius={4}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full rounded-full border-4 border-zinc-700 border-dashed flex items-center justify-center">
                    <span className="text-xs text-zinc-500 font-bold">N/A</span>
                </div>
              )}
            </div>
            
            <div className="flex-1 grid grid-cols-1 gap-2.5">
               {categoryData.map(c => (
                 <div key={c.name} className="flex items-center gap-3 group cursor-default">
                   {/* Tag style label */}
                   <div className="w-8 h-2 rounded-sm shadow-sm transition-all group-hover:scale-x-110" style={{ backgroundColor: c.color }}></div>
                   <span className="text-xs text-zinc-300 font-bold uppercase tracking-wide truncate">{c.name}</span>
                 </div>
               ))}
               {categoryData.length === 0 && <p className="text-zinc-500 text-xs italic">Log activities to see breakdown</p>}
            </div>
        </div>
      </div>
    </div>
  );
};

interface JourneyMapProps {
  goals: Goal[];
  onGoalClick: (id: string) => void;
}

export const JourneyMap: React.FC<JourneyMapProps> = ({ goals, onGoalClick }) => {
  const [activeCategories, setActiveCategories] = useState<GoalCategory[]>(Object.values(GoalCategory));
  const usedCategories = Array.from(new Set(goals.map(g => g.category))) as GoalCategory[];

  const allLogs = goals.flatMap(g => g.logs.map(l => ({
    ...l,
    goalTitle: g.title,
    category: g.category,
    goalId: g.id
  })));

  const filteredLogs = allLogs.filter(l => activeCategories.includes(l.category));

  // Sort logs: Oldest first (Index 0) -> Newest last
  const sortedLogs = filteredLogs.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const toggleCategory = (cat: GoalCategory) => {
      setActiveCategories(prev => {
          if (prev.includes(cat)) {
              return prev.filter(c => c !== cat);
          } else {
              return [...prev, cat];
          }
      });
  };

  return (
    <div className="flex flex-row relative min-h-full bg-zinc-900">
        {/* Left Sidebar - Vertical Toggles (Sticky) */}
        <div className="w-12 shrink-0 flex flex-col items-start gap-3 pt-8 sticky top-0 h-screen z-30 ml-0.5">
             {usedCategories.length === 0 && (
                <div className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest py-4 text-center w-full rotate-180" style={{ writingMode: 'vertical-rl' }}>
                    Filters
                </div>
             )}
            {usedCategories.map(cat => {
                const isActive = activeCategories.includes(cat);
                const color = CATEGORY_COLORS[cat];
                return (
                    <button
                        key={cat}
                        onClick={() => toggleCategory(cat)}
                        className={`
                            relative w-10 h-24 rounded-r-lg flex items-center justify-center transition-all duration-300
                            shadow-md border-y border-r border-zinc-700/50
                            ${isActive ? 'translate-x-0 bg-zinc-800' : '-translate-x-2 bg-zinc-900 opacity-60 hover:translate-x-0'}
                        `}
                        style={{ 
                            borderColor: isActive ? color : '#3f3f46',
                            borderLeft: 'none',
                        }}
                    >
                        <span 
                            className="text-[9px] font-black uppercase tracking-widest whitespace-nowrap" 
                            style={{ 
                                color: isActive ? 'white' : '#71717a',
                                transform: 'rotate(-90deg)'
                            }}
                        >
                            {cat}
                        </span>
                        <div 
                            className={`absolute right-1.5 top-2 w-1.5 h-1.5 rounded-full transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}
                            style={{ backgroundColor: color }}
                        ></div>
                    </button>
                )
            })}
        </div>

        {/* Right Content - Straight Timeline (Top to Bottom) */}
        <div className="flex-1 relative pb-20 pt-4 pl-2 pr-4">
            {/* Central Line */}
            <div className="absolute left-1/2 top-4 bottom-0 w-0 border-l-2 border-dashed border-zinc-800 transform -translate-x-1/2 z-0"></div>

            {/* flex-col: Start at top, newest at bottom */}
            <div className="flex flex-col w-full gap-10 relative z-10">
                
                {/* Start Marker (Top) */}
                <div className="flex justify-center items-center mt-2 mb-6">
                     <div className="bg-zinc-900 px-5 py-2 rounded-full border border-zinc-800 text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] shadow-sm z-10 ring-4 ring-zinc-900">
                        Start 2026
                     </div>
                </div>

                {/* Empty State */}
                {sortedLogs.length === 0 && (
                    <div className="self-center bg-zinc-800/50 p-6 rounded-2xl border-2 border-zinc-800 border-dashed text-center max-w-[200px] backdrop-blur-sm mt-4">
                        <p className="text-xs text-zinc-500 font-bold">No visible milestones</p>
                    </div>
                )}

                {/* Logs */}
                {sortedLogs.map((log, index) => {
                    const isLeft = index % 2 === 0; // Alternating
                    const isAvoid = log.category === GoalCategory.AVOID;
                    
                    return (
                        <div 
                            key={`${log.goalId}-${log.id}`}
                            onClick={() => onGoalClick(log.goalId)}
                            className={`flex w-full items-center relative group cursor-pointer ${isLeft ? 'justify-start' : 'justify-end'}`}
                        >
                            {/* The Card */}
                            <div className={`
                                w-[45%] bg-zinc-800 p-3 rounded-xl border-l-4 shadow-lg relative overflow-hidden transition-transform hover:scale-105 active:scale-95
                                ${isLeft ? 'mr-auto text-right' : 'ml-auto text-left'}
                                ${isAvoid ? 'ring-1 ring-red-500/30' : ''}
                            `}
                            style={{ borderLeftColor: CATEGORY_COLORS[log.category] }}
                            >
                                <div className={`flex items-center gap-2 mb-1.5 ${isLeft ? 'flex-row-reverse' : 'flex-row'}`}>
                                    <span className="bg-zinc-900/50 px-1.5 py-0.5 rounded text-[9px] font-black text-zinc-500 uppercase">
                                        {new Date(log.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                    {log.count > 0 && (
                                        <span className={`text-[9px] font-bold ${isAvoid ? 'text-red-500' : 'text-orange-400'}`}>
                                            {isAvoid ? '-' : '+'}{log.count}
                                        </span>
                                    )}
                                </div>
                                <p className="text-xs font-bold text-zinc-200 line-clamp-2 leading-snug">{log.note || 'Activity'}</p>
                            </div>

                            {/* Center Node on the Line */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-zinc-900 rounded-full border-2 z-20 flex items-center justify-center shadow-md ring-4 ring-zinc-900"
                                 style={{ borderColor: CATEGORY_COLORS[log.category] }}
                            >
                                <div className={`w-1.5 h-1.5 rounded-full ${isAvoid ? 'bg-red-500' : 'bg-zinc-600'}`}></div>
                            </div>
                            
                            {/* Connector Line */}
                            <div className={`
                                absolute top-1/2 -translate-y-1/2 h-px bg-zinc-700 w-[5%] border-b border-dashed border-zinc-700 opacity-50
                                ${isLeft ? 'left-[45%]' : 'right-[45%]'}
                            `}></div>
                        </div>
                    );
                })}
            </div>
        </div>
    </div>
  );
};
