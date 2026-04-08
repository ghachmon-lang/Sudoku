import type { Difficulty } from '../types';

interface CompletionModalProps {
  difficulty: Difficulty;
  solveTime: number;
  hintsUsed: number;
  isNewBest: boolean;
  onNewGame: () => void;
  onHome: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function CompletionModal({
  difficulty,
  solveTime,
  hintsUsed,
  isNewBest,
  onNewGame,
  onHome,
}: CompletionModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-bg-secondary rounded-3xl p-6 w-full max-w-sm text-center animate-in fade-in zoom-in">
        {/* Celebration */}
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-text-primary mb-1">Puzzle Complete!</h2>
        {isNewBest && (
          <div className="text-accent font-semibold text-sm mb-4">New Personal Best!</div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 my-6">
          <div className="bg-bg-primary rounded-xl p-3">
            <div className="text-lg font-bold text-text-primary">{formatTime(solveTime)}</div>
            <div className="text-xs text-text-muted">Time</div>
          </div>
          <div className="bg-bg-primary rounded-xl p-3">
            <div className="text-lg font-bold text-text-primary capitalize">{difficulty}</div>
            <div className="text-xs text-text-muted">Difficulty</div>
          </div>
          <div className="bg-bg-primary rounded-xl p-3">
            <div className="text-lg font-bold text-text-primary">{hintsUsed}</div>
            <div className="text-xs text-text-muted">Hints</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            className="w-full bg-accent hover:bg-accent-dim text-white font-semibold
              py-3 rounded-xl text-lg transition-all active:scale-95 touch-manipulation"
            onClick={onNewGame}
          >
            New Game
          </button>
          <button
            className="w-full bg-bg-tertiary hover:bg-border text-text-secondary
              font-medium py-3 rounded-xl transition-all active:scale-95 touch-manipulation"
            onClick={onHome}
          >
            Home
          </button>
        </div>
      </div>
    </div>
  );
}
