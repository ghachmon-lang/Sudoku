import type { GameHistory } from '../types';

interface DailyPageProps {
  onPlayDaily: () => void;
  todayCompleted: boolean;
  dailyStreak: number;
  history: GameHistory[];
}

export default function DailyPage({ onPlayDaily, todayCompleted, dailyStreak, history }: DailyPageProps) {
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const dailyHistory = history.filter(h => h.isDaily).slice(0, 10);

  return (
    <div className="flex flex-col items-center gap-6 px-4 py-6 h-full overflow-y-auto">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-text-primary">Daily Puzzle</h1>
        <p className="text-text-muted text-sm mt-1">{today}</p>
      </div>

      {/* Daily card */}
      <div className="w-full max-w-sm bg-gradient-to-br from-accent/20 to-accent/5 border border-accent/30 rounded-2xl p-6 text-center">
        {todayCompleted ? (
          <>
            <div className="text-5xl mb-3">✓</div>
            <h2 className="text-xl font-bold text-text-primary">Completed!</h2>
            <p className="text-text-secondary text-sm mt-1">Come back tomorrow for a new puzzle</p>
          </>
        ) : (
          <>
            <div className="text-5xl mb-3">☀</div>
            <h2 className="text-xl font-bold text-text-primary">Today's Challenge</h2>
            <p className="text-text-secondary text-sm mt-2 mb-4">A fresh puzzle awaits</p>
            <button
              className="bg-accent hover:bg-accent-dim text-white font-semibold
                py-3 px-8 rounded-xl text-lg transition-all active:scale-95 touch-manipulation
                shadow-lg shadow-accent/25"
              onClick={onPlayDaily}
            >
              Play Now
            </button>
          </>
        )}
      </div>

      {/* Daily streak */}
      <div className="w-full max-w-sm bg-bg-secondary rounded-2xl p-4 text-center">
        <div className="text-3xl font-bold text-accent">{dailyStreak}</div>
        <div className="text-xs text-text-muted mt-1">Daily Streak</div>
      </div>

      {/* Daily history */}
      {dailyHistory.length > 0 && (
        <div className="w-full max-w-sm">
          <h2 className="text-lg font-semibold text-text-primary mb-3">Recent Dailies</h2>
          <div className="bg-bg-secondary rounded-2xl divide-y divide-border">
            {dailyHistory.map(game => (
              <div key={game.id} className="flex items-center justify-between px-4 py-3">
                <div className="text-sm text-text-secondary">
                  {new Date(game.date).toLocaleDateString()}
                </div>
                <div className="text-text-secondary font-mono text-sm">
                  {Math.floor(game.solveTime / 60)}:{(game.solveTime % 60).toString().padStart(2, '0')}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
