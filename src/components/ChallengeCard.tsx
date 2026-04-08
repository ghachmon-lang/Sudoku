import type { WeeklyChallenge } from '../types';
import { getWeekStartDisplay } from '../services/challenges';

interface ChallengeCardProps {
  challenge: WeeklyChallenge;
}

export default function ChallengeCard({ challenge }: ChallengeCardProps) {
  const percent = Math.min(100, Math.round((challenge.progress / challenge.target) * 100));

  return (
    <div className="w-full bg-bg-secondary border border-border rounded-2xl p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-accent uppercase tracking-wider">
          Weekly Challenge
        </span>
        <span className="text-xs text-text-muted">
          Week of {getWeekStartDisplay(challenge.weekStart)}
        </span>
      </div>

      <p className="text-text-primary font-medium text-sm mb-3">
        {challenge.description}
      </p>

      {/* Progress bar */}
      <div className="w-full bg-border rounded-full h-2.5 mb-1.5">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${
            challenge.completed ? 'bg-success' : 'bg-accent'
          }`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-text-muted">
          {challenge.progress} / {challenge.target}
        </span>
        {challenge.completed && (
          <span className="text-xs font-semibold text-success">
            Completed!
          </span>
        )}
      </div>
    </div>
  );
}
