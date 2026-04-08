import type { Difficulty } from '../types';

interface PlayPageProps {
  onStartGame: (difficulty: Difficulty) => void;
  hasInProgressGame: boolean;
  onContinueGame: () => void;
}

const difficulties: { level: Difficulty; label: string; desc: string; color: string }[] = [
  { level: 'easy', label: 'Easy', desc: 'Perfect for warming up', color: 'from-green-500/20 to-green-600/5 border-green-500/30' },
  { level: 'medium', label: 'Medium', desc: 'A steady challenge', color: 'from-blue-500/20 to-blue-600/5 border-blue-500/30' },
  { level: 'hard', label: 'Hard', desc: 'For seasoned solvers', color: 'from-amber-500/20 to-amber-600/5 border-amber-500/30' },
  { level: 'expert', label: 'Expert', desc: 'Only the brave', color: 'from-red-500/20 to-red-600/5 border-red-500/30' },
];

export default function PlayPage({ onStartGame, hasInProgressGame, onContinueGame }: PlayPageProps) {
  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">Sudoku</h1>
        <p className="text-text-muted text-sm mt-1">Choose your challenge</p>
      </div>

      {/* Continue button */}
      {hasInProgressGame && (
        <button
          className="w-full max-w-sm bg-accent hover:bg-accent-dim text-white font-semibold
            py-4 rounded-2xl text-lg transition-all active:scale-95 touch-manipulation
            shadow-lg shadow-accent/25"
          onClick={onContinueGame}
        >
          Continue Game
        </button>
      )}

      {/* Difficulty cards */}
      <div className="w-full max-w-sm flex flex-col gap-3">
        {difficulties.map(({ level, label, desc, color }) => (
          <button
            key={level}
            className={`w-full bg-gradient-to-r ${color} border rounded-2xl p-4
              text-left transition-all active:scale-[0.97] touch-manipulation
              hover:brightness-110`}
            onClick={() => onStartGame(level)}
          >
            <div className="font-bold text-text-primary text-lg">{label}</div>
            <div className="text-text-secondary text-sm">{desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
