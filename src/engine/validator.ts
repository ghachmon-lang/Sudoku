import type { Board } from '../types';

const SIZE = 9;
const BOX = 3;

/**
 * Returns all cells that conflict with the value at (row, col).
 * Checks row, column, and 3x3 box.
 */
export function getConflicts(
  board: Board,
  row: number,
  col: number,
): { row: number; col: number }[] {
  const value = board[row][col];
  if (value === null) return [];

  const conflicts: { row: number; col: number }[] = [];
  const seen = new Set<string>();

  const addConflict = (r: number, c: number) => {
    const key = `${r},${c}`;
    if (!seen.has(key)) {
      seen.add(key);
      conflicts.push({ row: r, col: c });
    }
  };

  // Check row
  for (let c = 0; c < SIZE; c++) {
    if (c !== col && board[row][c] === value) {
      addConflict(row, c);
    }
  }

  // Check column
  for (let r = 0; r < SIZE; r++) {
    if (r !== row && board[r][col] === value) {
      addConflict(r, col);
    }
  }

  // Check 3x3 box
  const boxRowStart = Math.floor(row / BOX) * BOX;
  const boxColStart = Math.floor(col / BOX) * BOX;
  for (let r = boxRowStart; r < boxRowStart + BOX; r++) {
    for (let c = boxColStart; c < boxColStart + BOX; c++) {
      if ((r !== row || c !== col) && board[r][c] === value) {
        addConflict(r, c);
      }
    }
  }

  return conflicts;
}

/**
 * Checks whether every cell on the board is filled (non-null).
 */
export function isBoardComplete(board: Board): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] === null) return false;
    }
  }
  return true;
}

/**
 * Checks whether the player's board matches the solution exactly.
 */
export function isBoardCorrect(board: Board, solution: Board): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}
