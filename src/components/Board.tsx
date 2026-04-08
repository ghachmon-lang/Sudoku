import type { Board as BoardType, CellValue } from '../types';

interface CellProps {
  value: CellValue;
  notes: number[];
  isGiven: boolean;
  isSelected: boolean;
  isRelated: boolean;
  isSameNumber: boolean;
  isError: boolean;
  onClick: () => void;
}

function Cell({ value, notes, isGiven, isSelected, isRelated, isSameNumber, isError, onClick }: CellProps) {
  let bgClass = 'bg-bg-secondary';
  if (isSelected) bgClass = 'bg-cell-selected';
  else if (isError) bgClass = 'bg-cell-error';
  else if (isSameNumber) bgClass = 'bg-accent-glow';
  else if (isRelated) bgClass = 'bg-cell-related';

  const textClass = isGiven ? 'text-cell-given font-bold' : 'text-cell-player';

  return (
    <button
      className={`${bgClass} flex items-center justify-center aspect-square w-full
        transition-colors duration-100 active:scale-95 touch-manipulation
        outline-none focus-visible:ring-2 focus-visible:ring-accent`}
      onClick={onClick}
      aria-label={value ? `Cell value ${value}` : 'Empty cell'}
    >
      {value ? (
        <span className={`${textClass} text-lg sm:text-xl md:text-2xl leading-none`}>
          {value}
        </span>
      ) : notes.length > 0 ? (
        <div className="grid grid-cols-3 gap-0 w-full h-full p-0.5">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
            <span
              key={n}
              className="text-[8px] sm:text-[9px] text-text-muted flex items-center justify-center leading-none"
            >
              {notes.includes(n) ? n : ''}
            </span>
          ))}
        </div>
      ) : null}
    </button>
  );
}

interface BoardProps {
  puzzle: BoardType;
  playerBoard: BoardType;
  notes: number[][][];
  selectedCell: { row: number; col: number } | null;
  conflicts: { row: number; col: number }[];
  onCellClick: (row: number, col: number) => void;
}

export default function Board({ puzzle, playerBoard, notes, selectedCell, conflicts, onCellClick }: BoardProps) {
  const selectedValue = selectedCell
    ? playerBoard[selectedCell.row][selectedCell.col]
    : null;

  const isRelated = (row: number, col: number): boolean => {
    if (!selectedCell) return false;
    const { row: sr, col: sc } = selectedCell;
    if (row === sr && col === sc) return false;
    return (
      row === sr ||
      col === sc ||
      (Math.floor(row / 3) === Math.floor(sr / 3) &&
        Math.floor(col / 3) === Math.floor(sc / 3))
    );
  };

  const isError = (row: number, col: number): boolean => {
    return conflicts.some(c => c.row === row && c.col === col);
  };

  const isSameNumber = (row: number, col: number): boolean => {
    if (!selectedValue || selectedValue === null) return false;
    if (selectedCell && row === selectedCell.row && col === selectedCell.col) return false;
    return playerBoard[row][col] === selectedValue;
  };

  return (
    <div className="w-[min(98vw,98vh-180px,500px)] mx-auto aspect-square">
      <div
        className="grid grid-cols-9 gap-0 border-[3px] border-text-primary rounded-lg overflow-hidden"
        role="grid"
        aria-label="Sudoku board"
      >
        {playerBoard.map((row, r) =>
          row.map((cell, c) => (
            <div
              key={`${r}-${c}`}
              className={`
                ${c % 3 === 2 && c !== 8 ? 'border-r-[3px] border-r-text-primary' : c !== 8 ? 'border-r border-r-border-light' : ''}
                ${r % 3 === 2 && r !== 8 ? 'border-b-[3px] border-b-text-primary' : r !== 8 ? 'border-b border-b-border-light' : ''}
              `}
            >
              <Cell
                value={cell}
                notes={notes[r]?.[c] || []}
                isGiven={puzzle[r][c] !== null}
                isSelected={selectedCell?.row === r && selectedCell?.col === c}
                isRelated={isRelated(r, c)}
                isSameNumber={isSameNumber(r, c)}
                isError={isError(r, c)}
                onClick={() => onCellClick(r, c)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
