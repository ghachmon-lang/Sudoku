import type { UserSettings } from '../types';

interface SettingsPageProps {
  settings: UserSettings;
  pin: string;
  onToggleDarkMode: () => void;
  onToggleErrorHighlighting: () => void;
  onToggleShowTimer: () => void;
  onRestorePin: () => void;
}

export default function SettingsPage({
  settings,
  pin,
  onToggleDarkMode,
  onToggleErrorHighlighting,
  onToggleShowTimer,
  onRestorePin,
}: SettingsPageProps) {
  return (
    <div className="flex flex-col gap-6 px-4 py-6 h-full overflow-y-auto">
      <h1 className="text-2xl font-bold text-text-primary text-center">Settings</h1>

      {/* Game settings */}
      <div className="max-w-sm mx-auto w-full">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">Game</h2>
        <div className="bg-bg-secondary rounded-2xl divide-y divide-border">
          <ToggleRow
            label="Error Highlighting"
            description="Show conflicts in real-time"
            checked={settings.errorHighlighting}
            onToggle={onToggleErrorHighlighting}
          />
          <ToggleRow
            label="Show Timer"
            description="Display solve time during play"
            checked={settings.showTimer}
            onToggle={onToggleShowTimer}
          />
        </div>
      </div>

      {/* Appearance */}
      <div className="max-w-sm mx-auto w-full">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">Appearance</h2>
        <div className="bg-bg-secondary rounded-2xl divide-y divide-border">
          <ToggleRow
            label="Dark Mode"
            description="Reduce eye strain"
            checked={settings.darkMode}
            onToggle={onToggleDarkMode}
          />
        </div>
      </div>

      {/* Cloud sync */}
      <div className="max-w-sm mx-auto w-full">
        <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider mb-3 px-1">Cloud Sync</h2>
        <div className="bg-bg-secondary rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-text-primary font-medium">Your PIN</div>
              <div className="text-text-muted text-xs">Use this to restore data on a new device</div>
            </div>
          </div>
          <div className="bg-bg-primary rounded-xl p-3 text-center font-mono text-2xl font-bold text-accent tracking-[0.3em]">
            {pin || '------'}
          </div>
          <button
            className="w-full mt-3 bg-bg-tertiary hover:bg-border text-text-secondary
              font-medium py-3 rounded-xl transition-all active:scale-95 touch-manipulation text-sm"
            onClick={onRestorePin}
          >
            Restore from PIN
          </button>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onToggle,
}: {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <div>
        <div className="text-text-primary font-medium text-sm">{label}</div>
        <div className="text-text-muted text-xs">{description}</div>
      </div>
      <button
        className={`w-12 h-7 rounded-full transition-colors duration-200 touch-manipulation relative
          ${checked ? 'bg-accent' : 'bg-bg-tertiary'}`}
        onClick={onToggle}
        role="switch"
        aria-checked={checked}
        aria-label={label}
      >
        <div
          className={`absolute top-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200
            ${checked ? 'translate-x-5' : 'translate-x-0.5'}`}
        />
      </button>
    </div>
  );
}
