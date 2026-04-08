import { useState, useCallback } from 'react';
import './App.css';
import { useGame } from './hooks/useGame';
import { useSettings } from './hooks/useSettings';
import { useStats } from './hooks/useStats';
import { loadUserData, initUserData, clearGameState } from './services/storage';
import TabBar from './components/TabBar';
import CompletionModal from './components/CompletionModal';
import PlayPage from './pages/PlayPage';
import GamePage from './pages/GamePage';
import StatsPage from './pages/StatsPage';
import DailyPage from './pages/DailyPage';
import SettingsPage from './pages/SettingsPage';
import type { Difficulty } from './types/index';

type Screen = 'menu' | 'game';

function App() {
  const [activeTab, setActiveTab] = useState('play');
  const [screen, setScreen] = useState<Screen>('menu');
  const [showCompletion, setShowCompletion] = useState(false);
  const [completionRecorded, setCompletionRecorded] = useState(false);

  const game = useGame();
  const { settings, toggleDarkMode, toggleErrorHighlighting, toggleShowTimer } = useSettings();
  const { stats, history, recordCompletion } = useStats();

  const userData = loadUserData() ?? initUserData();

  const handleStartGame = useCallback((difficulty: Difficulty) => {
    game.startNewGame(difficulty);
    setScreen('game');
    setShowCompletion(false);
    setCompletionRecorded(false);
  }, [game]);

  const handleContinueGame = useCallback(() => {
    setScreen('game');
    setShowCompletion(false);
  }, []);

  const handlePlayDaily = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    game.startNewGame('medium', true, today);
    setScreen('game');
    setShowCompletion(false);
    setCompletionRecorded(false);
  }, [game]);

  const handleBack = useCallback(() => {
    setScreen('menu');
  }, []);

  const handleNumber = useCallback((num: number) => {
    if (game.isNotesMode) {
      game.toggleNote(num);
    } else {
      game.placeNumber(num);
    }
  }, [game]);

  const handleRestorePin = useCallback(() => {
    const pin = prompt('Enter your 6-digit PIN:');
    if (pin && pin.length === 6) {
      // TODO: Firebase restore — for now just show alert
      alert('Cloud restore will be available soon! Your PIN: ' + userData.pin);
    }
  }, [userData.pin]);

  // Check for completion
  if (game.gameState?.completed && !showCompletion && !completionRecorded) {
    setShowCompletion(true);
    setCompletionRecorded(true);
    recordCompletion(
      game.gameState.difficulty,
      game.gameState.elapsed,
      game.gameState.hintsUsed,
      game.gameState.isDaily,
    );
    clearGameState();
  }

  // Check if today's daily is completed
  const today = new Date().toISOString().split('T')[0];
  const todayCompleted = history.some(h => h.isDaily && h.date.startsWith(today) && h.completed);
  const dailyStreak = history.filter(h => h.isDaily && h.completed).length;

  // Check if new best time
  const isNewBest = game.gameState?.completed
    ? (stats.bestTimes[game.gameState.difficulty] === game.gameState.elapsed)
    : false;

  // Game screen
  if (screen === 'game' && game.gameState) {
    return (
      <div className="h-full flex flex-col bg-bg-primary">
        <GamePage
          gameState={game.gameState}
          selectedCell={game.selectedCell}
          conflicts={settings.errorHighlighting ? game.conflicts : []}
          isNotesMode={game.isNotesMode}
          isPaused={game.isPaused}
          showTimer={settings.showTimer}
          canUndo={game.gameState.moveIndex >= 0}
          canRedo={game.gameState.moveIndex < game.gameState.moveHistory.length - 1}
          onCellClick={game.selectCell}
          onNumber={handleNumber}
          onErase={game.erase}
          onUndo={game.undo}
          onRedo={game.redo}
          onHint={game.useHint}
          onToggleNotes={() => game.setIsNotesMode(!game.isNotesMode)}
          onPause={game.togglePause}
          onBack={handleBack}
        />
        {showCompletion && game.gameState && (
          <CompletionModal
            difficulty={game.gameState.difficulty}
            solveTime={game.gameState.elapsed}
            hintsUsed={game.gameState.hintsUsed}
            isNewBest={isNewBest}
            onNewGame={() => {
              setShowCompletion(false);
              handleStartGame(game.gameState!.difficulty);
            }}
            onHome={() => {
              setShowCompletion(false);
              setScreen('menu');
            }}
          />
        )}
      </div>
    );
  }

  // Menu screens
  return (
    <div className="h-full flex flex-col bg-bg-primary">
      <div className="flex-1 overflow-hidden">
        {activeTab === 'play' && (
          <PlayPage
            onStartGame={handleStartGame}
            hasInProgressGame={game.gameState !== null && !game.gameState.completed}
            onContinueGame={handleContinueGame}
          />
        )}
        {activeTab === 'daily' && (
          <DailyPage
            onPlayDaily={handlePlayDaily}
            todayCompleted={todayCompleted}
            dailyStreak={dailyStreak}
            history={history}
          />
        )}
        {activeTab === 'stats' && (
          <StatsPage stats={stats} history={history} />
        )}
        {activeTab === 'settings' && (
          <SettingsPage
            settings={settings}
            pin={userData.pin}
            onToggleDarkMode={toggleDarkMode}
            onToggleErrorHighlighting={toggleErrorHighlighting}
            onToggleShowTimer={toggleShowTimer}
            onRestorePin={handleRestorePin}
          />
        )}
      </div>
      <div className="p-3 pb-safe">
        <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </div>
  );
}

export default App;
