import ZoomableBoard from '../components/ZoomableBoard';
import NumberPad from '../components/NumberPad';
import TopBar from '../components/TopBar';
import type { GameState } from '../types';

interface GamePageProps {
  gameState: GameState;
  selectedCell: { row: number; col: number } | null;
  conflicts: { row: number; col: number }[];
  isNotesMode: boolean;
  isPaused: boolean;
  showTimer: boolean;
  canUndo: boolean;
  canRedo: boolean;
  onCellClick: (row: number, col: number) => void;
  onNumber: (num: number) => void;
  onErase: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onHint: () => void;
  onToggleNotes: () => void;
  onPause: () => void;
  onBack: () => void;
}

export default function GamePage({
  gameState,
  selectedCell,
  conflicts,
  isNotesMode,
  isPaused,
  showTimer,
  canUndo,
  canRedo,
  onCellClick,
  onNumber,
  onErase,
  onUndo,
  onRedo,
  onHint,
  onToggleNotes,
  onPause,
  onBack,
}: GamePageProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Fixed top bar */}
      <div className="shrink-0 px-3 pt-2">
        <TopBar
          difficulty={gameState.difficulty}
          elapsed={gameState.elapsed}
          isPaused={isPaused}
          showTimer={showTimer}
          onPause={onPause}
          onBack={onBack}
        />
      </div>

      {/* Pause overlay */}
      {isPaused ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="text-6xl mb-4">&#x23F8;</div>
            <h2 className="text-2xl font-bold text-text-primary mb-2">Paused</h2>
            <p className="text-text-muted">Tap play to resume</p>
          </div>
        </div>
      ) : (
        <>
          {/* Zoomable board area — fills remaining space */}
          <ZoomableBoard
            puzzle={gameState.puzzle}
            playerBoard={gameState.playerBoard}
            notes={gameState.notes}
            selectedCell={selectedCell}
            conflicts={conflicts}
            onCellClick={onCellClick}
          />

          {/* Fixed bottom controls — never zooms */}
          <div className="shrink-0 px-3 pb-3 pt-2 bg-bg-primary">
            <NumberPad
              onNumber={onNumber}
              onErase={onErase}
              onUndo={onUndo}
              onRedo={onRedo}
              onHint={onHint}
              onToggleNotes={onToggleNotes}
              isNotesMode={isNotesMode}
              playerBoard={gameState.playerBoard}
              canUndo={canUndo}
              canRedo={canRedo}
            />
          </div>
        </>
      )}
    </div>
  );
}
