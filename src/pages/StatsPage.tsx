import type { UserStats, GameHistory, Difficulty } from '../types';

interface StatsPageProps {
  stats: UserStats;
  history: GameHistory[];
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

const difficultyOrder: Difficulty[] = ['easy', 'medium', 'hard', 'expert'];
const difficultyColors: Record<Difficulty, string> = {
  easy: 'text-green-400',
  medium: 'text-blue-400',
  hard: 'text-amber-400',
  expert: 'text-red-400',
};

export default function StatsPage({ stats, history }: StatsPageProps) {
  // Build streak calendar (last 30 days)
  const today = new Date();
  const last30Days: { date: string; played: boolean }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    const played = history.some(h => h.date.startsWith(dateStr) && h.completed);
    last30Days.push({ date: dateStr, played });
  }

  return (
    <div className="flex flex-col gap-6 px-4 py-6 h-full overflow-y-auto">
      <h1 className="text-2xl font-bold text-text-primary text-center">Statistics</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 max-w-sm mx-auto w-full">
        <StatCard label="Total Solved" value={stats.totalSolved.toString()} />
        <StatCard label="Current Streak" value={`${stats.currentStreak} day${stats.currentStreak !== 1 ? 's' : ''}`} />
        <StatCard label="Longest Streak" value={`${stats.longestStreak} day${stats.longestStreak !== 1 ? 's' : ''}`} />
        <StatCard
          label="Completion Rate"
          value={history.length > 0
            ? `${Math.round((history.filter(h => h.completed).length / history.length) * 100)}%`
            : '—'
          }
        />
      </div>

      {/* Best times */}
      <div className="max-w-sm mx-auto w-full">
        <h2 className="text-lg font-semibold text-text-primary mb-3">Best Times</h2>
        <div className="bg-bg-secondary rounded-2xl divide-y divide-border">
          {difficultyOrder.map(d => (
            <div key={d} className="flex items-center justify-between px-4 py-3">
              <span className={`font-medium capitalize ${difficultyColors[d]}`}>{d}</span>
              <span className="text-text-secondary font-mono">
                {stats.bestTimes[d] !== null ? formatTime(stats.bestTimes[d]!) : '—'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Streak calendar */}
      <div className="max-w-sm mx-auto w-full">
        <h2 className="text-lg font-semibold text-text-primary mb-3">Last 30 Days</h2>
        <div className="grid grid-cols-10 gap-1.5">
          {last30Days.map(({ date, played }) => (
            <div
              key={date}
              className={`aspect-square rounded-md ${played ? 'bg-accent' : 'bg-bg-secondary'}`}
              title={date}
            />
          ))}
        </div>
      </div>

      {/* Recent history */}
      <div className="max-w-sm mx-auto w-full pb-4">
        <h2 className="text-lg font-semibold text-text-primary mb-3">Recent Games</h2>
        {history.length === 0 ? (
          <p className="text-text-muted text-center py-4">No games yet. Start playing!</p>
        ) : (
          <div className="bg-bg-secondary rounded-2xl divide-y divide-border">
            {history.slice(0, 20).map(game => (
              <div key={game.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <span className={`font-medium capitalize text-sm ${difficultyColors[game.difficulty]}`}>
                    {game.difficulty}
                  </span>
                  {game.isDaily && <span className="text-xs text-accent ml-2">Daily</span>}
                  <div className="text-xs text-text-muted">
                    {new Date(game.date).toLocaleDateString()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-text-secondary font-mono text-sm">
                    {formatTime(game.solveTime)}
                  </div>
                  {game.hintsUsed > 0 && (
                    <div className="text-xs text-text-muted">{game.hintsUsed} hint{game.hintsUsed > 1 ? 's' : ''}</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-bg-secondary rounded-2xl p-4 text-center">
      <div className="text-2xl font-bold text-text-primary">{value}</div>
      <div className="text-xs text-text-muted mt-1">{label}</div>
    </div>
  );
}
