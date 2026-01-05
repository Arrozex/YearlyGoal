export enum GoalCategory {
  CAREER = 'Career',
  HEALTH = 'Health',
  FINANCE = 'Finance',
  LEARNING = 'Learning',
  TRAVEL = 'Travel',
  PERSONAL = 'Personal',
}

// Adjusted for better visibility on dark backgrounds
export const CATEGORY_COLORS: Record<GoalCategory, string> = {
  [GoalCategory.CAREER]: '#60a5fa', // blue-400
  [GoalCategory.HEALTH]: '#34d399', // emerald-400
  [GoalCategory.FINANCE]: '#fbbf24', // amber-400
  [GoalCategory.LEARNING]: '#a78bfa', // violet-400
  [GoalCategory.TRAVEL]: '#f472b6', // pink-400
  [GoalCategory.PERSONAL]: '#94a3b8', // slate-400
};

export interface ActivityLog {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  note: string; // Short description of activity
  reflection?: string; // Insights or thoughts
  count: number; // Amount done (e.g. 1, 5, 10)
}

export interface Goal {
  id: string;
  title: string;
  category: GoalCategory;
  targetCount?: number; // Optional target (e.g. 100 times)
  currentCount: number; // Sum of all log counts
  unit?: string; // e.g. "pages", "km", "times"
  logs: ActivityLog[];
  createdAt: string;
}

export type ViewState = 'dashboard' | 'goals' | 'map' | 'add' | 'log_selection';