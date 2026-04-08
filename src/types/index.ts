export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export type CellValue = number | null; // 1-9 or null for empty

export type Board = CellValue[][];

export type Notes = Set<number>[][];

export interface Move {
  row: number;
  col: number;
  previousValue: CellValue;
  newValue: CellValue;
  previousNotes: number[];
  newNotes: number[];
  type: 'value' | 'note';
}

export interface GameState {
  puzzle: Board;
  solution: Board;
  playerBoard: Board;
  notes: number[][][]; // serializable version of Notes
  difficulty: Difficulty;
  elapsed: number;
  moveHistory: Move[];
  moveIndex: number; // for undo/redo
  isDaily: boolean;
  dailyDate?: string;
  hintsUsed: number;
  startedAt: string;
  completed: boolean;
}

export interface GameHistory {
  id: string;
  date: string;
  difficulty: Difficulty;
  solveTime: number;
  hintsUsed: number;
  isDaily: boolean;
  completed: boolean;
}

export interface BestTimes {
  easy: number | null;
  medium: number | null;
  hard: number | null;
  expert: number | null;
}

export interface UserStats {
  totalSolved: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string | null;
  bestTimes: BestTimes;
}

export interface UserSettings {
  darkMode: boolean;
  errorHighlighting: boolean;
  showTimer: boolean;
}

export interface UserData {
  pin: string;
  createdAt: string;
  settings: UserSettings;
  stats: UserStats;
}

export interface WeeklyChallenge {
  weekId: string;
  weekStart: string;
  description: string;
  type: 'count' | 'time' | 'difficulty';
  target: number;
  difficulty?: Difficulty;
  progress: number;
  completed: boolean;
}
