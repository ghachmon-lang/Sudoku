import { useState, useEffect, useCallback } from 'react';
import type { Difficulty, UserStats, GameHistory } from '../types';
import {
  loadUserData,
  saveUserData,
  initUserData,
  saveHistory,
  loadHistory,
} from '../services/storage';

interface UseStatsReturn {
  stats: UserStats;
  history: GameHistory[];
  recordCompletion: (
    difficulty: Difficulty,
    solveTime: number,
    hintsUsed: number,
    isDaily: boolean,
  ) => void;
}

const DEFAULT_STATS: UserStats = {
  totalSolved: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastPlayedDate: null,
  bestTimes: { easy: null, medium: null, hard: null, expert: null },
};

/**
 * Return YYYY-MM-DD for a Date object in local time.
 */
function toDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Get yesterday's date string.
 */
function getYesterday(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return toDateString(d);
}

export function useStats(): UseStatsReturn {
  const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
  const [history, setHistory] = useState<GameHistory[]>([]);

  useEffect(() => {
    const userData = loadUserData() ?? initUserData();
    setStats(userData.stats);
    setHistory(loadHistory());
  }, []);

  const recordCompletion = useCallback(
    (difficulty: Difficulty, solveTime: number, hintsUsed: number, isDaily: boolean) => {
      // Save history entry
      const entry: GameHistory = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        date: new Date().toISOString(),
        difficulty,
        solveTime,
        hintsUsed,
        isDaily,
        completed: true,
      };
      saveHistory(entry);

      // Update stats
      const userData = loadUserData() ?? initUserData();
      const s = { ...userData.stats };
      const today = toDateString(new Date());
      const yesterday = getYesterday();

      s.totalSolved += 1;

      // Streak logic
      if (s.lastPlayedDate === yesterday) {
        s.currentStreak += 1;
      } else if (s.lastPlayedDate === today) {
        // Already played today, keep streak as-is
      } else {
        s.currentStreak = 1;
      }

      if (s.currentStreak > s.longestStreak) {
        s.longestStreak = s.currentStreak;
      }

      s.lastPlayedDate = today;

      // Best times
      const currentBest = s.bestTimes[difficulty];
      if (currentBest === null || solveTime < currentBest) {
        s.bestTimes = { ...s.bestTimes, [difficulty]: solveTime };
      }

      userData.stats = s;
      saveUserData(userData);

      setStats(s);
      setHistory(loadHistory());
    },
    [],
  );

  return { stats, history, recordCompletion };
}
