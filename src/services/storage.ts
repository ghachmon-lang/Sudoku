import type {
  GameState,
  GameHistory,
  UserData,
  UserSettings,
  UserStats,
} from '../types';

const KEYS = {
  GAME_STATE: 'sudoku_game_state',
  HISTORY: 'sudoku_history',
  USER_DATA: 'sudoku_user_data',
} as const;

// ---------------------------------------------------------------------------
// Game State
// ---------------------------------------------------------------------------

export function saveGameState(state: GameState): void {
  try {
    localStorage.setItem(KEYS.GAME_STATE, JSON.stringify(state));
  } catch {
    console.error('Failed to save game state');
  }
}

export function loadGameState(): GameState | null {
  try {
    const raw = localStorage.getItem(KEYS.GAME_STATE);
    if (!raw) return null;
    return JSON.parse(raw) as GameState;
  } catch {
    console.error('Failed to load game state');
    return null;
  }
}

export function clearGameState(): void {
  try {
    localStorage.removeItem(KEYS.GAME_STATE);
  } catch {
    console.error('Failed to clear game state');
  }
}

// ---------------------------------------------------------------------------
// Game History
// ---------------------------------------------------------------------------

export function saveHistory(entry: GameHistory): void {
  try {
    const history = loadHistory();
    history.push(entry);
    localStorage.setItem(KEYS.HISTORY, JSON.stringify(history));
  } catch {
    console.error('Failed to save history entry');
  }
}

export function loadHistory(): GameHistory[] {
  try {
    const raw = localStorage.getItem(KEYS.HISTORY);
    if (!raw) return [];
    return JSON.parse(raw) as GameHistory[];
  } catch {
    console.error('Failed to load history');
    return [];
  }
}

// ---------------------------------------------------------------------------
// User Data
// ---------------------------------------------------------------------------

export function saveUserData(data: UserData): void {
  try {
    localStorage.setItem(KEYS.USER_DATA, JSON.stringify(data));
  } catch {
    console.error('Failed to save user data');
  }
}

export function loadUserData(): UserData | null {
  try {
    const raw = localStorage.getItem(KEYS.USER_DATA);
    if (!raw) return null;
    return JSON.parse(raw) as UserData;
  } catch {
    console.error('Failed to load user data');
    return null;
  }
}

/**
 * Create default user data with a random 6-digit PIN.
 * Persists to localStorage and returns the new data.
 */
export function initUserData(): UserData {
  const pin = String(Math.floor(100000 + Math.random() * 900000));

  const defaultSettings: UserSettings = {
    darkMode: false,
    errorHighlighting: true,
    showTimer: true,
  };

  const defaultStats: UserStats = {
    totalSolved: 0,
    currentStreak: 0,
    longestStreak: 0,
    lastPlayedDate: null,
    bestTimes: { easy: null, medium: null, hard: null, expert: null },
  };

  const data: UserData = {
    pin,
    createdAt: new Date().toISOString(),
    settings: defaultSettings,
    stats: defaultStats,
  };

  saveUserData(data);
  return data;
}
