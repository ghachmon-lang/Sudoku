import type { Difficulty } from '../types';

interface TopBarProps {
  difficulty: Difficulty;
  elapsed: number;
  isPaused: boolean;
  showTimer: boolean;
  onPause: () => void;
  onBack: () => void;
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const difficultyColors: Record<Difficulty, string> = {
  easy: 'bg-success/20 text-success',
  medium: 'bg-accent/20 text-accent',
  hard: 'bg-warning/20 text-warning',
  expert: 'bg-error/20 text-error',
};

export default function TopBar({ difficulty, elapsed, isPaused, showTimer, onPause, onBack }: TopBarProps) {
  return (
    <div className="flex items-center justify-between w-[min(98vw,98vh-180px,500px)] mx-auto px-1 py-2">
      {/* Back button */}
      <button
        className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center
          text-text-secondary hover:bg-bg-tertiary active:scale-90 transition-all touch-manipulation"
        onClick={onBack}
        aria-label="Back to menu"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Difficulty badge */}
      <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${difficultyColors[difficulty]}`}>
        {difficulty}
      </span>

      {/* Timer */}
      <div className="flex items-center gap-2">
        {showTimer && (
          <span className="text-text-secondary font-mono text-sm tabular-nums min-w-[3.5rem] text-right">
            {isPaused ? '--:--' : formatTime(elapsed)}
          </span>
        )}
        <button
          className="w-10 h-10 rounded-xl bg-bg-secondary flex items-center justify-center
            text-text-secondary hover:bg-bg-tertiary active:scale-90 transition-all touch-manipulation"
          onClick={onPause}
          aria-label={isPaused ? 'Resume' : 'Pause'}
        >
          {isPaused ? (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M8 5v14l11-7z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
