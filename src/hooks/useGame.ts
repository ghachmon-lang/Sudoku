import { useState, useEffect, useCallback, useRef } from 'react';
import type {
  GameState,
  Difficulty,
  Move,
  Board,
} from '../types';
import { generatePuzzle, generateDailyPuzzle } from '../engine';
import { getConflicts, isBoardComplete, isBoardCorrect } from '../engine/validator';
import { saveGameState, loadGameState, clearGameState } from '../services/storage';

interface SelectedCell {
  row: number;
  col: number;
}

interface ConflictCell {
  row: number;
  col: number;
}

interface UseGameReturn {
  gameState: GameState | null;
  selectedCell: SelectedCell | null;
  selectCell: (row: number, col: number) => void;
  placeNumber: (num: number) => void;
  toggleNote: (num: number) => void;
  undo: () => void;
  redo: () => void;
  useHint: () => void;
  erase: () => void;
  startNewGame: (difficulty: Difficulty, isDaily?: boolean, dailyDate?: string) => void;
  isNotesMode: boolean;
  setIsNotesMode: (v: boolean) => void;
  isPaused: boolean;
  togglePause: () => void;
  conflicts: ConflictCell[];
}

function cloneBoard(board: Board): Board {
  return board.map((row) => [...row]);
}

function cloneNotes(notes: number[][][]): number[][][] {
  return notes.map((row) => row.map((cell) => [...cell]));
}

/**
 * Compute all conflicting cells across the entire player board.
 */
function computeAllConflicts(board: Board): ConflictCell[] {
  const set = new Set<string>();
  const result: ConflictCell[] = [];

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === null) continue;
      const cellConflicts = getConflicts(board, r, c);
      if (cellConflicts.length > 0) {
        // Add this cell and all its conflicts
        const key = `${r},${c}`;
        if (!set.has(key)) {
          set.add(key);
          result.push({ row: r, col: c });
        }
        for (const cf of cellConflicts) {
          const cfKey = `${cf.row},${cf.col}`;
          if (!set.has(cfKey)) {
            set.add(cfKey);
            result.push(cf);
          }
        }
      }
    }
  }

  return result;
}

export function useGame(): UseGameReturn {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [isNotesMode, setIsNotesMode] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [conflicts, setConflicts] = useState<ConflictCell[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load saved game on mount
  useEffect(() => {
    const saved = loadGameState();
    if (saved) {
      setGameState(saved);
      setConflicts(computeAllConflicts(saved.playerBoard));
    }
  }, []);

  // Auto-save whenever gameState changes
  useEffect(() => {
    if (gameState) {
      saveGameState(gameState);
    }
  }, [gameState]);

  // Timer: tick elapsed every second when not paused and game is active
  useEffect(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (gameState && !gameState.completed && !isPaused) {
      timerRef.current = setInterval(() => {
        setGameState((prev) => {
          if (!prev || prev.completed || isPaused) return prev;
          return { ...prev, elapsed: prev.elapsed + 1 };
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [gameState?.completed, isPaused, gameState !== null]);

  const isGivenCell = useCallback(
    (row: number, col: number): boolean => {
      if (!gameState) return false;
      return gameState.puzzle[row][col] !== null;
    },
    [gameState],
  );

  const startNewGame = useCallback(
    (difficulty: Difficulty, isDaily = false, dailyDate?: string) => {
      let puzzle: Board;
      let solution: Board;

      if (isDaily && dailyDate) {
        const result = generateDailyPuzzle(dailyDate);
        puzzle = result.puzzle;
        solution = result.solution;
      } else {
        const result = generatePuzzle(difficulty);
        puzzle = result.puzzle;
        solution = result.solution;
      }

      const emptyNotes: number[][][] = Array.from({ length: 9 }, () =>
        Array.from({ length: 9 }, () => []),
      );

      const newState: GameState = {
        puzzle,
        solution,
        playerBoard: cloneBoard(puzzle),
        notes: emptyNotes,
        difficulty,
        elapsed: 0,
        moveHistory: [],
        moveIndex: -1,
        isDaily,
        dailyDate,
        hintsUsed: 0,
        startedAt: new Date().toISOString(),
        completed: false,
      };

      clearGameState();
      setGameState(newState);
      setSelectedCell(null);
      setIsNotesMode(false);
      setIsPaused(false);
      setConflicts([]);
    },
    [],
  );

  const selectCell = useCallback((row: number, col: number) => {
    setSelectedCell({ row, col });
  }, []);

  const pushMove = useCallback(
    (state: GameState, move: Move): GameState => {
      // Truncate any redo history beyond current index
      const history = state.moveHistory.slice(0, state.moveIndex + 1);
      history.push(move);
      return {
        ...state,
        moveHistory: history,
        moveIndex: history.length - 1,
      };
    },
    [],
  );

  const placeNumber = useCallback(
    (num: number) => {
      if (!gameState || !selectedCell || gameState.completed) return;
      const { row, col } = selectedCell;
      if (isGivenCell(row, col)) return;

      const previousValue = gameState.playerBoard[row][col];
      const previousNotes = [...gameState.notes[row][col]];

      const newBoard = cloneBoard(gameState.playerBoard);
      const newNotes = cloneNotes(gameState.notes);

      // If same number already placed, treat as toggle off
      newBoard[row][col] = previousValue === num ? null : num;
      // Clear notes when placing a value
      newNotes[row][col] = [];

      const move: Move = {
        row,
        col,
        previousValue,
        newValue: newBoard[row][col],
        previousNotes,
        newNotes: [],
        type: 'value',
      };

      let updated: GameState = {
        ...gameState,
        playerBoard: newBoard,
        notes: newNotes,
      };
      updated = pushMove(updated, move);

      // Check completion
      if (isBoardComplete(newBoard) && isBoardCorrect(newBoard, gameState.solution)) {
        updated = { ...updated, completed: true };
      }

      setGameState(updated);
      setConflicts(computeAllConflicts(newBoard));
    },
    [gameState, selectedCell, isGivenCell, pushMove],
  );

  const toggleNote = useCallback(
    (num: number) => {
      if (!gameState || !selectedCell || gameState.completed) return;
      const { row, col } = selectedCell;
      if (isGivenCell(row, col)) return;
      // Don't allow notes on a cell that has a value
      if (gameState.playerBoard[row][col] !== null) return;

      const previousNotes = [...gameState.notes[row][col]];
      const newNotes = cloneNotes(gameState.notes);

      const idx = newNotes[row][col].indexOf(num);
      if (idx >= 0) {
        newNotes[row][col].splice(idx, 1);
      } else {
        newNotes[row][col].push(num);
        newNotes[row][col].sort();
      }

      const move: Move = {
        row,
        col,
        previousValue: null,
        newValue: null,
        previousNotes,
        newNotes: [...newNotes[row][col]],
        type: 'note',
      };

      let updated: GameState = { ...gameState, notes: newNotes };
      updated = pushMove(updated, move);
      setGameState(updated);
    },
    [gameState, selectedCell, isGivenCell, pushMove],
  );

  const undo = useCallback(() => {
    if (!gameState || gameState.moveIndex < 0) return;

    const move = gameState.moveHistory[gameState.moveIndex];
    const newBoard = cloneBoard(gameState.playerBoard);
    const newNotes = cloneNotes(gameState.notes);

    newBoard[move.row][move.col] = move.previousValue;
    newNotes[move.row][move.col] = [...move.previousNotes];

    const updated: GameState = {
      ...gameState,
      playerBoard: newBoard,
      notes: newNotes,
      moveIndex: gameState.moveIndex - 1,
      completed: false, // un-complete if undoing
    };

    setGameState(updated);
    setConflicts(computeAllConflicts(newBoard));
  }, [gameState]);

  const redo = useCallback(() => {
    if (!gameState || gameState.moveIndex >= gameState.moveHistory.length - 1) return;

    const move = gameState.moveHistory[gameState.moveIndex + 1];
    const newBoard = cloneBoard(gameState.playerBoard);
    const newNotes = cloneNotes(gameState.notes);

    newBoard[move.row][move.col] = move.newValue;
    newNotes[move.row][move.col] = [...move.newNotes];

    let updated: GameState = {
      ...gameState,
      playerBoard: newBoard,
      notes: newNotes,
      moveIndex: gameState.moveIndex + 1,
    };

    if (isBoardComplete(newBoard) && isBoardCorrect(newBoard, gameState.solution)) {
      updated = { ...updated, completed: true };
    }

    setGameState(updated);
    setConflicts(computeAllConflicts(newBoard));
  }, [gameState]);

  const useHint = useCallback(() => {
    if (!gameState || gameState.completed || !selectedCell) return;
    const { row, col } = selectedCell;

    // Only hint on non-given cells that aren't already correct
    if (isGivenCell(row, col)) return;
    if (gameState.playerBoard[row][col] === gameState.solution[row][col]) return;

    const previousValue = gameState.playerBoard[row][col];
    const previousNotes = [...gameState.notes[row][col]];

    const newBoard = cloneBoard(gameState.playerBoard);
    const newNotes = cloneNotes(gameState.notes);

    newBoard[row][col] = gameState.solution[row][col];
    newNotes[row][col] = [];

    const move: Move = {
      row,
      col,
      previousValue,
      newValue: gameState.solution[row][col],
      previousNotes,
      newNotes: [],
      type: 'value',
    };

    let updated: GameState = {
      ...gameState,
      playerBoard: newBoard,
      notes: newNotes,
      hintsUsed: gameState.hintsUsed + 1,
    };
    updated = pushMove(updated, move);

    if (isBoardComplete(newBoard) && isBoardCorrect(newBoard, gameState.solution)) {
      updated = { ...updated, completed: true };
    }

    setGameState(updated);
    setConflicts(computeAllConflicts(newBoard));
  }, [gameState, selectedCell, isGivenCell, pushMove]);

  const erase = useCallback(() => {
    if (!gameState || !selectedCell || gameState.completed) return;
    const { row, col } = selectedCell;
    if (isGivenCell(row, col)) return;

    const previousValue = gameState.playerBoard[row][col];
    const previousNotes = [...gameState.notes[row][col]];

    // Nothing to erase
    if (previousValue === null && previousNotes.length === 0) return;

    const newBoard = cloneBoard(gameState.playerBoard);
    const newNotes = cloneNotes(gameState.notes);

    newBoard[row][col] = null;
    newNotes[row][col] = [];

    const move: Move = {
      row,
      col,
      previousValue,
      newValue: null,
      previousNotes,
      newNotes: [],
      type: 'value',
    };

    let updated: GameState = {
      ...gameState,
      playerBoard: newBoard,
      notes: newNotes,
    };
    updated = pushMove(updated, move);

    setGameState(updated);
    setConflicts(computeAllConflicts(newBoard));
  }, [gameState, selectedCell, isGivenCell, pushMove]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  return {
    gameState,
    selectedCell,
    selectCell,
    placeNumber,
    toggleNote,
    undo,
    redo,
    useHint,
    erase,
    startNewGame,
    isNotesMode,
    setIsNotesMode,
    isPaused,
    togglePause,
    conflicts,
  };
}
