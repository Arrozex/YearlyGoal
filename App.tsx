import React, { useState } from 'react';
import { 
  Goal, 
  GoalCategory, 
  ActivityLog,
  CATEGORY_COLORS, 
  ViewState 
} from './types';
import { DashboardCharts, JourneyMap } from './components/Visualizations';
import { 
  LayoutDashboard, 
  ListTodo, 
  Map as MapIcon, 
  PlusCircle, 
  ChevronRight, 
  Trash2,
  Calendar,
  ArrowLeft,
  History,
  Plus,
  X,
  PenLine,
  Diff,
  AlertTriangle,
  MessageSquare
} from 'lucide-react';

// --- Helper Hook for LocalStorage ---
function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T) => {
    try {
      setStoredValue(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
}

// --- Components ---

// Header: Short height (h-12)
const Header: React.FC<{ title: string; showBack?: boolean; onBack?: () => void }> = ({ title, showBack, onBack }) => (
  <header className="fixed top-0 left-0 right-0 bg-zinc-900/90 backdrop-blur-xl border-b border-zinc-800 h-12 flex items-center px-4 z-50">
    {showBack && (
        <button onClick={onBack} className="mr-3 p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all">
            <ArrowLeft size={20} />
        </button>
    )}
    <h1 className="text-lg font-black text-white tracking-tight">{title}</h1>
  </header>
);

const NavBar: React.FC<{ current: ViewState; onChange: (v: ViewState) => void }> = ({ current, onChange }) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-zinc-900 border-t border-zinc-800 pb-safe h-[84px] grid grid-cols-5 items-center z-50 px-4">
    <button 
      onClick={() => onChange('dashboard')}
      className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all ${current === 'dashboard' ? 'text-orange-500 bg-zinc-800/80' : 'text-zinc-500 hover:text-zinc-300'}`}
    >
      <LayoutDashboard size={24} strokeWidth={current === 'dashboard' ? 2.5 : 2} />
    </button>
    <button 
      onClick={() => onChange('map')}
      className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all ${current === 'map' ? 'text-orange-500 bg-zinc-800/80' : 'text-zinc-500 hover:text-zinc-300'}`}
    >
      <MapIcon size={24} strokeWidth={current === 'map' ? 2.5 : 2} />
    </button>
    
    {/* Central Action Button: Log Activity */}
    <div className="flex justify-center -mt-8">
        <button 
          onClick={() => onChange('log_selection')}
          className="bg-orange-500 text-zinc-900 rounded-[24px] w-16 h-16 flex items-center justify-center shadow-lg shadow-orange-500/20 hover:scale-105 hover:bg-orange-400 transition-all border-4 border-zinc-900"
        >
          <PenLine size={28} strokeWidth={2.5} />
        </button>
    </div>

    <button 
      onClick={() => onChange('goals')}
      className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all ${current === 'goals' ? 'text-orange-500 bg-zinc-800/80' : 'text-zinc-500 hover:text-zinc-300'}`}
    >
      <ListTodo size={24} strokeWidth={current === 'goals' ? 2.5 : 2} />
    </button>
    
    <button 
      onClick={() => onChange('add')}
      className={`flex flex-col items-center gap-1.5 p-2 rounded-2xl transition-all ${current === 'add' ? 'text-orange-500 bg-zinc-800/80' : 'text-zinc-500 hover:text-zinc-300'}`}
    >
      <Plus size={24} strokeWidth={current === 'add' ? 2.5 : 2} />
    </button>
  </nav>
);

const ConfirmationModal: React.FC<{
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}> = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={onCancel}></div>
      <div className="bg-zinc-800 rounded-[2rem] border border-zinc-700 p-6 w-full max-w-sm relative z-10 animate-in zoom-in-95 duration-200 shadow-2xl">
         <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center text-red-500 mb-5 mx-auto border border-red-500/20">
             <AlertTriangle size={28} />
         </div>
         <h3 className="text-xl font-bold text-white mb-2 text-center">{title}</h3>
         <p className="text-zinc-400 text-sm mb-8 text-center leading-relaxed">{message}</p>
         <div className="flex gap-3">
             <button onClick={onCancel} className="flex-1 py-3.5 text-zinc-300 font-bold bg-zinc-700 rounded-2xl hover:bg-zinc-600 transition-colors">Cancel</button>
             <button onClick={onConfirm} className="flex-1 py-3.5 text-white font-bold bg-red-600 rounded-2xl hover:bg-red-500 shadow-lg shadow-red-900/30 transition-colors">Delete</button>
         </div>
      </div>
    </div>
  );
}

const QuickLogModal: React.FC<{
  goal: Goal;
  onClose: () => void;
  onSave: (goalId: string, log: ActivityLog) => void;
}> = ({ goal, onClose, onSave }) => {
  const [note, setNote] = useState('');
  const [reflection, setReflection] = useState('');
  const [count, setCount] = useState<string>('1');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numCount = parseFloat(count) || 0;
    const newLog: ActivityLog = {
        id: Date.now().toString(),
        date,
        note: note || 'Quick Log',
        reflection: reflection,
        count: numCount
    };
    onSave(goal.id, newLog);
    onClose();
  }

  return (
      <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto transition-opacity" onClick={onClose}></div>
          <div className="bg-zinc-800 w-full max-w-md p-6 rounded-t-[2rem] sm:rounded-[2rem] border-t sm:border border-zinc-700 shadow-2xl pointer-events-auto transform transition-transform animate-in slide-in-from-bottom-10">
              <div className="flex justify-between items-center mb-6">
                  <h3 className="font-bold text-xl text-white">Log Activity</h3>
                  <button onClick={onClose} className="p-2 hover:bg-zinc-700 rounded-full text-zinc-400 transition-colors">
                      <X size={24} />
                  </button>
              </div>
              
              <div className="mb-6 bg-zinc-900 p-4 rounded-2xl border border-zinc-700 flex items-center gap-4">
                  <div className="w-1.5 h-10 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[goal.category] }}></div>
                  <div>
                    <p className="font-bold text-white text-lg">{goal.title}</p>
                    <p className="text-xs text-zinc-500 uppercase tracking-wider font-bold">{goal.category}</p>
                  </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                   <div className="flex gap-4">
                        <div className="flex-1">
                            <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2">Date</label>
                            <input 
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-2xl text-white text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-zinc-600"
                                required
                            />
                        </div>
                        <div className="w-28">
                            <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2">Count ({goal.unit})</label>
                            <input 
                                type="number" 
                                value={count}
                                onChange={e => setCount(e.target.value)}
                                className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-2xl text-white text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-zinc-600 text-center font-mono"
                            />
                        </div>
                   </div>
                   <div>
                        <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2">Activity Name</label>
                        <input
                            type="text"
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="e.g. Read Chapter 4"
                            className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-2xl text-white text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-zinc-600"
                        />
                   </div>
                   <div>
                        <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2">Thoughts (Optional)</label>
                        <textarea 
                            value={reflection}
                            onChange={e => setReflection(e.target.value)}
                            placeholder="How did it go? Any key takeaways?"
                            rows={3}
                            className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-2xl text-white text-sm outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-zinc-600 resize-none"
                        />
                   </div>
                   <button type="submit" className="w-full bg-orange-500 text-zinc-900 py-4 rounded-2xl font-bold text-lg hover:bg-orange-400 active:scale-[0.98] transition-all shadow-lg shadow-orange-900/20 mt-2">
                        Save Entry
                   </button>
              </form>
          </div>
      </div>
  )
}

const SelectGoalForLogView: React.FC<{ 
    goals: Goal[]; 
    onSelect: (g: Goal) => void; 
    onCancel: () => void 
}> = ({ goals, onSelect, onCancel }) => {
    return (
        <div className="pt-16 px-6 pb-28 animate-in fade-in duration-300">
             <div className="mb-8">
                <h2 className="text-3xl font-black text-white mb-2">Select Goal</h2>
                <p className="text-zinc-400">Choose a target to update progress.</p>
             </div>
             
             {goals.length === 0 ? (
                 <div className="text-center py-16 bg-zinc-800 rounded-[2rem] border border-zinc-700 border-dashed">
                     <p className="text-zinc-500 mb-6 font-medium">No goals found.</p>
                     <button onClick={onCancel} className="text-orange-500 font-bold hover:text-orange-400">Go back</button>
                 </div>
             ) : (
                 <div className="grid gap-3">
                     {goals.map(g => (
                         <button 
                            key={g.id}
                            onClick={() => onSelect(g)}
                            className="w-full bg-zinc-800 p-5 rounded-2xl border border-zinc-700 flex items-center justify-between hover:border-orange-500/50 hover:bg-zinc-700 transition-all text-left group shadow-sm"
                         >
                             <div className="flex items-center gap-4">
                                 <div className="w-1.5 h-10 rounded-full group-hover:scale-y-110 transition-transform" style={{ backgroundColor: CATEGORY_COLORS[g.category] }}></div>
                                 <div>
                                     <h3 className="font-bold text-white text-lg group-hover:text-orange-500 transition-colors">{g.title}</h3>
                                     <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide mt-1">{g.currentCount} <span className="lowercase">{g.unit}</span></p>
                                 </div>
                             </div>
                             <div className="bg-zinc-900 p-2 rounded-full text-zinc-500 group-hover:text-white transition-colors">
                                <ChevronRight size={20} />
                             </div>
                         </button>
                     ))}
                 </div>
             )}
        </div>
    )
}

const AddGoalView: React.FC<{ onSave: (g: Goal) => void; onCancel: () => void }> = ({ onSave, onCancel }) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<GoalCategory>(GoalCategory.PERSONAL);
  const [targetCount, setTargetCount] = useState<string>('');
  const [unit, setUnit] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title) return;

    const newGoal: Goal = {
      id: Date.now().toString(),
      title,
      category,
      targetCount: targetCount ? parseInt(targetCount) : undefined,
      currentCount: 0,
      unit: unit || 'times',
      logs: [],
      createdAt: new Date().toISOString()
    };

    onSave(newGoal);
  };

  return (
    <div className="pt-16 px-6 pb-28 animate-in slide-in-from-bottom-5 duration-300">
      <h2 className="text-3xl font-black mb-2 text-white">New Goal</h2>
      <p className="text-zinc-400 mb-8">Define your vision for {new Date().getFullYear()}</p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2">Goal Title</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Read 20 Books"
            className="w-full p-4 rounded-2xl bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-600 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
            required
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-3">Category</label>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(GoalCategory).map(cat => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`p-3 text-xs font-bold rounded-xl border transition-all flex items-center gap-2 ${
                  category === cat 
                    ? 'border-transparent bg-zinc-700 text-white shadow-lg' 
                    : 'border-zinc-700 bg-zinc-800 text-zinc-500 hover:bg-zinc-700'
                }`}
              >
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }}></span>
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2">Target</label>
                <input 
                    type="number" 
                    value={targetCount}
                    onChange={(e) => setTargetCount(e.target.value)}
                    placeholder="e.g. 50"
                    className="w-full p-4 rounded-2xl bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-600 focus:border-orange-500 outline-none"
                />
             </div>
             <div>
                <label className="block text-[11px] font-bold text-zinc-500 uppercase mb-2">Unit</label>
                <input 
                    type="text" 
                    value={unit}
                    onChange={(e) => setUnit(e.target.value)}
                    placeholder="e.g. books"
                    className="w-full p-4 rounded-2xl bg-zinc-800 border border-zinc-700 text-white placeholder:text-zinc-600 focus:border-orange-500 outline-none"
                />
             </div>
        </div>

        <div className="bg-zinc-800/50 p-4 rounded-2xl border border-zinc-700 text-xs text-zinc-500 leading-relaxed">
            <p>Start small, think big. This goal will be tracked on your annual timeline.</p>
        </div>

        <div className="flex gap-4 pt-6">
            <button type="button" onClick={onCancel} className="flex-1 p-4 text-zinc-400 font-bold hover:text-white transition-colors">
                Cancel
            </button>
            <button 
                type="submit" 
                className="flex-1 bg-orange-500 text-zinc-900 p-4 rounded-2xl font-bold text-lg hover:bg-orange-400 flex items-center justify-center gap-2 shadow-lg shadow-orange-900/20"
            >
                Create Plan
            </button>
        </div>
      </form>
    </div>
  );
};

const GoalDetailView: React.FC<{ 
    goal: Goal; 
    onUpdate: (g: Goal) => void; 
    onDelete: (id: string) => void; 
    onBack: () => void 
}> = ({ goal, onUpdate, onDelete, onBack }) => {

    const [note, setNote] = useState('');
    const [reflection, setReflection] = useState('');
    const [count, setCount] = useState<string>('1');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    
    // Confirmation State
    const [confirmState, setConfirmState] = useState<{
        isOpen: boolean;
        type: 'log' | 'goal';
        id?: string;
    }>({ isOpen: false, type: 'log' });

    const handleAddLog = (e: React.FormEvent) => {
        e.preventDefault();
        const numCount = parseFloat(count) || 0;
        
        const newLog: ActivityLog = {
            id: Date.now().toString(),
            date: date,
            note: note || 'Activity logged',
            reflection: reflection,
            count: numCount
        };

        const updatedLogs = [newLog, ...goal.logs]; // Newest first
        updatedLogs.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

        onUpdate({
            ...goal,
            logs: updatedLogs,
            currentCount: goal.currentCount + numCount
        });

        // Reset form
        setNote('');
        setReflection('');
        setCount('1');
    };

    const confirmDeleteLog = (logId: string) => {
        setConfirmState({ isOpen: true, type: 'log', id: logId });
    }

    const confirmDeleteGoal = () => {
        setConfirmState({ isOpen: true, type: 'goal' });
    }

    const executeDelete = () => {
        if (confirmState.type === 'log' && confirmState.id) {
            const logEntry = goal.logs.find(l => l.id === confirmState.id);
            if(logEntry) {
                const updatedLogs = goal.logs.filter(l => l.id !== confirmState.id);
                const newCount = Math.max(0, goal.currentCount - logEntry.count);
                onUpdate({
                    ...goal,
                    logs: updatedLogs,
                    currentCount: newCount
                });
            }
        } else if (confirmState.type === 'goal') {
            onDelete(goal.id);
            onBack();
        }
        setConfirmState({ ...confirmState, isOpen: false });
    }

    const percentage = goal.targetCount ? Math.min(Math.round((goal.currentCount / goal.targetCount) * 100), 100) : 0;

    return (
        <div className="pt-16 px-6 pb-28 animate-in slide-in-from-right-5 duration-300 min-h-screen bg-zinc-900">
            {/* Header Section */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                    <span 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: CATEGORY_COLORS[goal.category] }}
                    ></span>
                    <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">{goal.category}</span>
                </div>
                <h2 className="text-4xl font-black text-white mb-6 leading-tight">{goal.title}</h2>
                
                <div className="bg-zinc-800 rounded-[2rem] p-6 border border-zinc-700 shadow-md">
                    <div className="flex justify-between items-end mb-4">
                        <div>
                             <p className="text-5xl font-black text-white">{goal.currentCount}</p>
                             <p className="text-xs text-zinc-500 font-bold uppercase tracking-wider mt-1">{goal.unit} COMPLETED</p>
                        </div>
                        {goal.targetCount && (
                             <div className="text-right">
                                 <p className="text-sm font-medium text-zinc-400 mb-1">Target: <span className="text-white">{goal.targetCount}</span></p>
                                 <div className="bg-zinc-700 px-3 py-1 rounded-lg inline-block">
                                     <p className="text-xs text-orange-400 font-bold">{percentage}% Done</p>
                                 </div>
                             </div>
                        )}
                    </div>
                    {goal.targetCount && (
                        <div className="h-4 w-full bg-zinc-900 rounded-full overflow-hidden border border-zinc-700/50">
                            <div 
                                className="h-full rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(249,115,22,0.3)]" 
                                style={{ width: `${percentage}%`, backgroundColor: '#f97316' }} // orange-500
                            ></div>
                        </div>
                    )}
                </div>
            </div>

            {/* Add Log Form */}
            <div className="mb-10">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <div className="bg-orange-500 p-1 rounded-md text-zinc-900"><Plus size={16} /></div> 
                    Add Progress
                </h3>
                <form onSubmit={handleAddLog} className="bg-zinc-800 rounded-[2rem] border border-zinc-700 p-5 shadow-md">
                     <div className="flex gap-4 mb-4">
                        <div className="flex-1">
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-2">Date</label>
                            <input 
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white outline-none focus:border-orange-500"
                                required
                            />
                        </div>
                        <div className="w-24">
                            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-2">Count</label>
                            <input 
                                type="number" 
                                value={count}
                                onChange={e => setCount(e.target.value)}
                                className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white outline-none focus:border-orange-500"
                            />
                        </div>
                     </div>
                     <div className="mb-4">
                         <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-2">Activity Name</label>
                         <input 
                            type="text" 
                            value={note}
                            onChange={e => setNote(e.target.value)}
                            placeholder="e.g. Read Chapter 1"
                            className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white outline-none focus:border-orange-500 placeholder:text-zinc-600"
                         />
                     </div>
                     <div className="mb-4">
                         <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wide mb-2">Thoughts</label>
                         <textarea 
                            value={reflection}
                            onChange={e => setReflection(e.target.value)}
                            placeholder="What did you learn? How did it feel?"
                            rows={2}
                            className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded-xl text-sm text-white outline-none focus:border-orange-500 resize-none placeholder:text-zinc-600"
                         />
                     </div>
                     <button type="submit" className="w-full bg-white text-zinc-900 py-3 rounded-xl text-sm font-bold hover:bg-zinc-200 transition-colors">
                        Save Entry
                     </button>
                </form>
            </div>

            {/* History List */}
            <div className="mb-10">
                <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <History size={20} className="text-zinc-500" /> History
                </h3>
                <div className="space-y-4 relative border-l-2 border-zinc-700 ml-3 pl-8">
                    {goal.logs.length === 0 && (
                        <p className="text-zinc-600 text-sm italic">No activities logged yet.</p>
                    )}
                    {goal.logs.map(log => (
                        <div key={log.id} className="relative group">
                            <div className="absolute -left-[39px] top-1.5 w-4 h-4 rounded-full bg-zinc-900 border-2 border-zinc-600 group-hover:border-orange-500 transition-colors"></div>
                            <p className="text-[10px] font-bold text-zinc-500 mb-1 uppercase tracking-wide">{new Date(log.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                            <div className="bg-zinc-800 p-4 rounded-2xl border border-zinc-700 pr-10 relative hover:border-zinc-600 transition-all shadow-sm">
                                <div className="flex justify-between items-start mb-1">
                                    <p className="text-base text-white font-bold">{log.note}</p>
                                    {log.count > 0 && (
                                        <span className="text-[10px] font-bold text-zinc-900 bg-orange-500 px-2 py-0.5 rounded ml-2">+{log.count}</span>
                                    )}
                                </div>
                                {log.reflection && (
                                    <div className="flex gap-3 items-start mt-3 pt-3 border-t border-zinc-700">
                                        <MessageSquare size={14} className="text-zinc-500 mt-0.5 shrink-0" />
                                        <p className="text-sm text-zinc-400 italic leading-snug">{log.reflection}</p>
                                    </div>
                                )}
                                <button 
                                    onClick={() => confirmDeleteLog(log.id)}
                                    className="absolute top-3 right-3 p-2 text-zinc-600 hover:text-red-500 hover:bg-zinc-700 rounded-full transition-all"
                                    title="Delete entry"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <button 
                onClick={confirmDeleteGoal}
                className="w-full p-4 text-red-500/80 bg-red-500/5 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-red-500/10 hover:text-red-500 transition-colors border border-red-500/10"
            >
                <Trash2 size={18} /> Delete Goal
            </button>
            
            <ConfirmationModal 
                isOpen={confirmState.isOpen}
                title={confirmState.type === 'goal' ? 'Delete Goal?' : 'Delete Activity?'}
                message={confirmState.type === 'goal' 
                    ? 'This will permanently remove this goal and all its history. This action cannot be undone.' 
                    : 'Are you sure you want to remove this activity log?'}
                onConfirm={executeDelete}
                onCancel={() => setConfirmState({...confirmState, isOpen: false})}
            />
        </div>
    );
}

// --- Main App Component ---

export default function App() {
  const [view, setView] = useState<ViewState>('dashboard');
  const [goals, setGoals] = useLocalStorage<Goal[]>('year_vision_goals', []);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [activeQuickLogGoal, setActiveQuickLogGoal] = useState<Goal | null>(null);

  // Derived state
  const selectedGoal = goals.find(g => g.id === selectedGoalId);

  const handleAddGoal = (newGoal: Goal) => {
    setGoals([...goals, newGoal]);
    setView('dashboard');
  };

  const handleUpdateGoal = (updatedGoal: Goal) => {
    setGoals(goals.map(g => g.id === updatedGoal.id ? updatedGoal : g));
  };

  const handleDeleteGoal = (id: string) => {
    setGoals(goals.filter(g => g.id !== id));
    if (selectedGoalId === id) setSelectedGoalId(null);
  };

  const handleQuickLogSave = (goalId: string, log: ActivityLog) => {
    const goal = goals.find(g => g.id === goalId);
    if (goal) {
        const updatedLogs = [log, ...goal.logs].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
        const updatedGoal = {
            ...goal,
            currentCount: goal.currentCount + log.count,
            logs: updatedLogs
        };
        setGoals(goals.map(g => g.id === goalId ? updatedGoal : g));
    }
  };

  // Render content based on state
  const renderContent = () => {
    if (selectedGoal) {
      return (
        <GoalDetailView 
          goal={selectedGoal} 
          onUpdate={handleUpdateGoal} 
          onDelete={handleDeleteGoal}
          onBack={() => setSelectedGoalId(null)}
        />
      );
    }

    switch (view) {
      case 'dashboard':
        return (
          <div className="pt-16 px-4 pb-28 animate-in fade-in duration-300">
             <div className="mb-6">
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mb-1">{new Date().getFullYear()}</p>
                <h2 className="text-3xl font-black text-white">Dashboard</h2>
             </div>
             <DashboardCharts goals={goals} />
             
             {/* Recent Activity Mini Feed */}
             <div className="mt-8">
                <h3 className="text-white font-bold mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                  Recent
                </h3>
                <div className="space-y-3">
                    {goals.flatMap(g => g.logs.map(l => ({...l, goalTitle: g.title, category: g.category})))
                        .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .slice(0, 3)
                        .map(log => (
                          <div key={log.id} className="bg-zinc-800/50 p-3 rounded-xl border border-zinc-700/50 flex items-center gap-3">
                              <div className="w-1 h-8 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[log.category] }}></div>
                              <div className="flex-1 min-w-0">
                                  <p className="text-zinc-300 text-sm font-bold truncate">{log.goalTitle}</p>
                                  <p className="text-zinc-500 text-xs truncate">{log.note}</p>
                              </div>
                              <span className="text-xs text-zinc-600 font-mono">{new Date(log.date).toLocaleDateString(undefined, {month:'numeric', day:'numeric'})}</span>
                          </div>
                        ))
                    }
                    {goals.flatMap(g => g.logs).length === 0 && (
                        <p className="text-zinc-600 text-xs italic">No activity yet.</p>
                    )}
                </div>
             </div>
          </div>
        );
      case 'map':
        return (
          <div className="h-full pt-12">
            <JourneyMap goals={goals} onGoalClick={setSelectedGoalId} />
          </div>
        );
      case 'goals':
        return (
           <div className="pt-16 px-6 pb-28 animate-in fade-in duration-300">
               <h2 className="text-3xl font-black text-white mb-6">Your Plans</h2>
               <div className="grid gap-3">
                   {goals.map(g => (
                       <button 
                          key={g.id}
                          onClick={() => setSelectedGoalId(g.id)}
                          className="w-full bg-zinc-800 p-5 rounded-2xl border border-zinc-700 flex items-center justify-between hover:border-orange-500/50 hover:bg-zinc-700 transition-all text-left group"
                       >
                           <div className="flex items-center gap-4">
                               <div className="w-1.5 h-10 rounded-full group-hover:scale-y-110 transition-transform" style={{ backgroundColor: CATEGORY_COLORS[g.category] }}></div>
                               <div>
                                   <h3 className="font-bold text-white text-lg">{g.title}</h3>
                                   <p className="text-xs text-zinc-500 font-medium uppercase tracking-wide mt-1">{g.currentCount} / {g.targetCount || '∞'} {g.unit}</p>
                               </div>
                           </div>
                           <ChevronRight size={20} className="text-zinc-600 group-hover:text-white" />
                       </button>
                   ))}
                   <button 
                      onClick={() => setView('add')}
                      className="w-full border-2 border-dashed border-zinc-800 p-5 rounded-2xl flex items-center justify-center gap-2 text-zinc-500 font-bold hover:text-white hover:border-zinc-600 transition-all"
                   >
                       <PlusCircle size={20} /> Add New Goal
                   </button>
               </div>
           </div>
        );
      case 'add':
        return <AddGoalView onSave={handleAddGoal} onCancel={() => setView('dashboard')} />;
      case 'log_selection':
        return <SelectGoalForLogView goals={goals} onSelect={(g) => { setActiveQuickLogGoal(g); setView('dashboard'); }} onCancel={() => setView('dashboard')} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100 font-sans selection:bg-orange-500/30">
      {/* Conditionally render Header */}
      {!selectedGoal && view !== 'add' && view !== 'log_selection' && (
          <Header title="Yearly Vision" />
      )}

      <main className="min-h-screen">
        {renderContent()}
      </main>

      {/* Nav Bar */}
      {!selectedGoal && view !== 'add' && view !== 'log_selection' && (
        <NavBar current={view} onChange={setView} />
      )}

      {/* Quick Log Modal Overlay */}
      {activeQuickLogGoal && (
          <QuickLogModal 
              goal={activeQuickLogGoal} 
              onClose={() => setActiveQuickLogGoal(null)} 
              onSave={handleQuickLogSave} 
          />
      )}
    </div>
  );
}