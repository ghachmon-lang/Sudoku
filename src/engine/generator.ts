import type { Board, Difficulty } from '../types';
import { isValidPlacement } from './solver';
import { hasUniqueSolution } from './solver';

const SIZE = 9;
const BOX = 3;

/**
 * Givens range per difficulty for a 9x9 grid (total cells = 81).
 */
const GIVENS_RANGE: Record<Difficulty, [number, number]> = {
  easy: [38, 45],
  medium: [30, 37],
  hard: [25, 29],
  expert: [20, 24],
};

// Seeded PRNG
type RNG = () => number;

function mulberry32(seed: number): RNG {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (Math.imul(31, hash) + str.charCodeAt(i)) | 0;
  }
  return hash;
}

function randInt(rng: RNG, min: number, max: number): number {
  return min + Math.floor(rng() * (max - min + 1));
}

function shuffle<T>(arr: T[], rng: RNG): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function emptyBoard(): Board {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
}

/**
 * Fill a single 3x3 box with shuffled digits 1-9.
 */
function fillBox(board: Board, rowStart: number, colStart: number, rng: RNG): void {
  const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rng);
  let idx = 0;
  for (let r = rowStart; r < rowStart + BOX; r++) {
    for (let c = colStart; c < colStart + BOX; c++) {
      board[r][c] = nums[idx++];
    }
  }
}

/**
 * Solve the board in-place using backtracking with randomised candidate order.
 */
function solveRandom(board: Board, rng: RNG): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] !== null) continue;
      const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9], rng);
      for (const num of nums) {
        if (!isValidPlacement(board, r, c, num)) continue;
        board[r][c] = num;
        if (solveRandom(board, rng)) return true;
        board[r][c] = null;
      }
      return false;
    }
  }
  return true;
}

/**
 * Generate a full valid 9x9 Sudoku board.
 * Fills the three diagonal 3x3 boxes first (they don't constrain each other),
 * then solves the remaining cells.
 */
function generateFullBoard(rng: RNG): Board {
  const board = emptyBoard();

  // Fill the three diagonal boxes
  for (let i = 0; i < SIZE; i += BOX) {
    fillBox(board, i, i, rng);
  }

  // Solve the rest
  solveRandom(board, rng);
  return board;
}

/**
 * Remove cells from a full board while maintaining a unique solution.
 */
function removeClues(solution: Board, targetGivens: number, rng: RNG): Board {
  const puzzle: Board = solution.map((row) => [...row]);
  let filledCount = SIZE * SIZE;

  const positions: [number, number][] = [];
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      positions.push([r, c]);
    }
  }
  const shuffled = shuffle(positions, rng);

  for (const [r, c] of shuffled) {
    if (filledCount <= targetGivens) break;
    if (puzzle[r][c] === null) continue;

    const backup = puzzle[r][c];
    puzzle[r][c] = null;

    if (hasUniqueSolution(puzzle)) {
      filledCount--;
    } else {
      puzzle[r][c] = backup;
    }
  }

  return puzzle;
}

export function generatePuzzle(difficulty: Difficulty): {
  puzzle: Board;
  solution: Board;
} {
  const rng: RNG = () => Math.random();
  const [minGivens, maxGivens] = GIVENS_RANGE[difficulty];
  const targetGivens = randInt(rng, minGivens, maxGivens);

  const solution = generateFullBoard(rng);
  const puzzle = removeClues(solution, targetGivens, rng);

  return { puzzle, solution };
}

export function generateDailyPuzzle(
  dateString: string,
  difficulty: Difficulty = 'medium',
): { puzzle: Board; solution: Board } {
  const seed = hashString(dateString);
  const rng = mulberry32(seed);
  const [minGivens, maxGivens] = GIVENS_RANGE[difficulty];
  const targetGivens = randInt(rng, minGivens, maxGivens);

  const solution = generateFullBoard(rng);
  const puzzle = removeClues(solution, targetGivens, rng);

  return { puzzle, solution };
}
