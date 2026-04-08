import type { Board } from '../types';

const SIZE = 9;
const BOX = 3;

/**
 * Check if placing `num` at (row, col) is valid.
 * Checks row, column, and 3x3 box.
 */
export function isValidPlacement(
  board: Board,
  row: number,
  col: number,
  num: number,
): boolean {
  // Check row
  for (let c = 0; c < SIZE; c++) {
    if (c !== col && board[row][c] === num) return false;
  }

  // Check column
  for (let r = 0; r < SIZE; r++) {
    if (r !== row && board[r][col] === num) return false;
  }

  // Check 3x3 box
  const boxRowStart = Math.floor(row / BOX) * BOX;
  const boxColStart = Math.floor(col / BOX) * BOX;
  for (let r = boxRowStart; r < boxRowStart + BOX; r++) {
    for (let c = boxColStart; c < boxColStart + BOX; c++) {
      if (r !== row || c !== col) {
        if (board[r][c] === num) return false;
      }
    }
  }

  return true;
}

/**
 * Solve a 9x9 Sudoku board using backtracking.
 */
export function solve(board: Board): Board | null {
  const copy: Board = board.map((row) => [...row]);
  if (solveInPlace(copy)) return copy;
  return null;
}

function solveInPlace(board: Board): boolean {
  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      if (board[r][c] !== null) continue;
      for (let num = 1; num <= SIZE; num++) {
        if (!isValidPlacement(board, r, c, num)) continue;
        board[r][c] = num;
        if (solveInPlace(board)) return true;
        board[r][c] = null;
      }
      return false;
    }
  }
  return true;
}

/**
 * Check if the board has exactly one solution.
 */
export function hasUniqueSolution(board: Board): boolean {
  let count = 0;

  function backtrack(b: Board): boolean {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (b[r][c] !== null) continue;
        for (let num = 1; num <= SIZE; num++) {
          if (!isValidPlacement(b, r, c, num)) continue;
          b[r][c] = num;
          if (backtrack(b)) return true;
          b[r][c] = null;
        }
        return false;
      }
    }
    count++;
    return count >= 2;
  }

  backtrack(board.map((row) => [...row]));
  return count === 1;
}
