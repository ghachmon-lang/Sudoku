import type { WeeklyChallenge, Difficulty } from '../types';

interface ChallengeTemplate {
  description: string;
  type: WeeklyChallenge['type'];
  target: number;
  difficulty?: Difficulty;
}

const CHALLENGE_POOL: ChallengeTemplate[] = [
  { description: 'Solve 5 puzzles this week', type: 'count', target: 5 },
  { description: 'Solve 3 puzzles this week', type: 'count', target: 3 },
  { description: 'Solve 7 puzzles this week', type: 'count', target: 7 },
  { description: 'Complete a puzzle under 10 minutes', type: 'time', target: 600 },
  { description: 'Complete a puzzle under 5 minutes', type: 'time', target: 300 },
  { description: 'Complete a puzzle under 15 minutes', type: 'time', target: 900 },
  { description: 'Solve a Hard puzzle', type: 'difficulty', target: 1, difficulty: 'hard' },
  { description: 'Solve an Expert puzzle', type: 'difficulty', target: 1, difficulty: 'expert' },
  { description: 'Solve 2 Medium puzzles', type: 'difficulty', target: 2, difficulty: 'medium' },
  { description: 'Solve 3 puzzles without using hints', type: 'count', target: 3 },
  { description: 'Play 3 days in a row', type: 'count', target: 3 },
  { description: 'Solve 2 Hard puzzles', type: 'difficulty', target: 2, difficulty: 'hard' },
];

/**
 * Simple hash to pick a challenge deterministically from the week.
 */
function weekHash(weekId: string): number {
  let hash = 0;
  for (let i = 0; i < weekId.length; i++) {
    hash = (Math.imul(31, hash) + weekId.charCodeAt(i)) | 0;
  }
  return Math.abs(hash);
}

/**
 * Get the Monday date string for the current week.
 */
export function getCurrentWeekId(): string {
  const now = new Date();
  const day = now.getDay();
  const diff = day === 0 ? -6 : 1 - day; // Monday = 1
  const monday = new Date(now);
  monday.setDate(now.getDate() + diff);
  return monday.toISOString().split('T')[0];
}

/**
 * Get the week start date as a readable string.
 */
export function getWeekStartDisplay(weekId: string): string {
  const d = new Date(weekId + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Get the challenge for a given week.
 */
export function getChallengeForWeek(weekId: string): Omit<WeeklyChallenge, 'progress' | 'completed'> {
  const idx = weekHash(weekId) % CHALLENGE_POOL.length;
  const template = CHALLENGE_POOL[idx];
  return {
    weekId,
    weekStart: weekId,
    description: template.description,
    type: template.type,
    target: template.target,
    difficulty: template.difficulty,
  };
}

const CHALLENGE_KEY = 'sudoku_weekly_challenge';

export function loadChallenge(): WeeklyChallenge | null {
  try {
    const raw = localStorage.getItem(CHALLENGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as WeeklyChallenge;
  } catch {
    return null;
  }
}

export function saveChallenge(challenge: WeeklyChallenge): void {
  try {
    localStorage.setItem(CHALLENGE_KEY, JSON.stringify(challenge));
  } catch {
    console.error('Failed to save challenge');
  }
}

/**
 * Get the current week's challenge, creating it if needed.
 */
export function getCurrentChallenge(): WeeklyChallenge {
  const weekId = getCurrentWeekId();
  const saved = loadChallenge();

  // If we have a saved challenge for this week, return it
  if (saved && saved.weekId === weekId) {
    return saved;
  }

  // New week — generate a new challenge
  const template = getChallengeForWeek(weekId);
  const challenge: WeeklyChallenge = {
    ...template,
    progress: 0,
    completed: false,
  };
  saveChallenge(challenge);
  return challenge;
}

/**
 * Update challenge progress after a completed game.
 */
export function updateChallengeProgress(
  solveTime: number,
  difficulty: Difficulty,
  hintsUsed: number,
): WeeklyChallenge {
  const challenge = getCurrentChallenge();
  if (challenge.completed) return challenge;

  let shouldIncrement = false;

  switch (challenge.type) {
    case 'count':
      // "Solve X puzzles" or "Solve X without hints"
      if (challenge.description.includes('without')) {
        shouldIncrement = hintsUsed === 0;
      } else if (challenge.description.includes('days in a row')) {
        // Days-in-a-row is handled by streak logic — count unique days
        const today = new Date().toISOString().split('T')[0];
        const lastDay = localStorage.getItem('sudoku_challenge_last_day');
        if (lastDay !== today) {
          localStorage.setItem('sudoku_challenge_last_day', today);
          shouldIncrement = true;
        }
      } else {
        shouldIncrement = true;
      }
      break;

    case 'time':
      // "Complete under X minutes"
      shouldIncrement = solveTime < challenge.target;
      break;

    case 'difficulty':
      // "Solve X [difficulty] puzzles"
      shouldIncrement = difficulty === challenge.difficulty;
      break;
  }

  if (shouldIncrement) {
    challenge.progress = Math.min(challenge.progress + 1, challenge.target);
    if (challenge.progress >= challenge.target) {
      challenge.completed = true;
    }
    saveChallenge(challenge);
  }

  return challenge;
}
