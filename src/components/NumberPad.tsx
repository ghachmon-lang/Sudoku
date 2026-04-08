import type { Board } from '../types';

interface NumberPadProps {
  onNumber: (num: number) => void;
  onErase: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onHint: () => void;
  onToggleNotes: () => void;
  isNotesMode: boolean;
  playerBoard: Board;
  canUndo: boolean;
  canRedo: boolean;
}

export default function NumberPad({
  onNumber,
  onErase,
  onUndo,
  onRedo,
  onHint,
  onToggleNotes,
  isNotesMode,
  playerBoard,
  canUndo,
  canRedo,
}: NumberPadProps) {
  // Count how many of each number are placed
  const counts = new Map<number, number>();
  for (const row of playerBoard) {
    for (const cell of row) {
      if (cell !== null) {
        counts.set(cell, (counts.get(cell) || 0) + 1);
      }
    }
  }

  return (
    <div className="w-[min(98vw,98vh-180px,500px)] mx-auto flex flex-col gap-3">
      {/* Number buttons 1-9 */}
      <div className="grid grid-cols-9 gap-1.5">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => {
          const isDimmed = (counts.get(num) || 0) >= 9;
          return (
            <button
              key={num}
              className={`h-14 sm:h-16 rounded-xl font-bold text-xl sm:text-2xl
                transition-all duration-100 active:scale-90 touch-manipulation
                ${isDimmed
                  ? 'bg-bg-tertiary/50 text-text-muted/30 cursor-default'
                  : 'bg-bg-secondary text-text-primary hover:bg-bg-tertiary active:bg-accent/30'
                }
                ${isNotesMode && !isDimmed ? 'ring-1 ring-accent/50' : ''}
              `}
              onClick={() => !isDimmed && onNumber(num)}
              disabled={isDimmed}
              aria-label={`${isNotesMode ? 'Note' : 'Place'} ${num}`}
            >
              {num}
            </button>
          );
        })}
      </div>

      {/* Control buttons */}
      <div className="grid grid-cols-5 gap-1.5">
        <ControlButton
          onClick={onUndo}
          disabled={!canUndo}
          label="Undo"
          icon={
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M3 10h10a5 5 0 0 1 0 10H9" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 14L3 10l4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <ControlButton
          onClick={onRedo}
          disabled={!canRedo}
          label="Redo"
          icon={
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M21 10H11a5 5 0 0 0 0 10h4" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M17 14l4-4-4-4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <ControlButton
          onClick={onErase}
          label="Erase"
          icon={
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M20 5H9l-7 7 7 7h11a2 2 0 002-2V7a2 2 0 00-2-2z" strokeLinecap="round" strokeLinejoin="round" />
              <line x1="18" y1="9" x2="12" y2="15" strokeLinecap="round" />
              <line x1="12" y1="9" x2="18" y2="15" strokeLinecap="round" />
            </svg>
          }
        />
        <ControlButton
          onClick={onToggleNotes}
          active={isNotesMode}
          label={isNotesMode ? 'Notes On' : 'Notes'}
          icon={
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
        <ControlButton
          onClick={onHint}
          label="Hint"
          icon={
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M9 18h6M10 22h4M12 2a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          }
        />
      </div>
    </div>
  );
}

function ControlButton({
  onClick,
  disabled,
  active,
  label,
  icon,
}: {
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <button
      className={`h-12 sm:h-14 rounded-xl flex flex-col items-center justify-center gap-0.5
        transition-all duration-100 active:scale-90 touch-manipulation
        ${disabled
          ? 'bg-bg-secondary/50 text-text-muted/30 cursor-default'
          : active
            ? 'bg-accent/20 text-accent ring-1 ring-accent/50'
            : 'bg-bg-secondary text-text-secondary hover:bg-bg-tertiary'
        }
      `}
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
    >
      {icon}
      <span className="text-[10px] sm:text-xs">{label}</span>
    </button>
  );
}
