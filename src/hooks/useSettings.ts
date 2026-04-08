import { useState, useEffect, useCallback } from 'react';
import type { UserSettings } from '../types';
import { loadUserData, saveUserData, initUserData } from '../services/storage';

interface UseSettingsReturn {
  settings: UserSettings;
  toggleDarkMode: () => void;
  toggleErrorHighlighting: () => void;
  toggleShowTimer: () => void;
}

const DEFAULT_SETTINGS: UserSettings = {
  darkMode: false,
  errorHighlighting: true,
  showTimer: true,
};

function persist(updated: UserSettings): void {
  const userData = loadUserData() ?? initUserData();
  userData.settings = updated;
  saveUserData(userData);
}

export function useSettings(): UseSettingsReturn {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);

  // Load settings on mount
  useEffect(() => {
    const userData = loadUserData() ?? initUserData();
    setSettings(userData.settings);
  }, []);

  // Apply dark mode class whenever the setting changes
  useEffect(() => {
    if (settings.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.darkMode]);

  // Persist whenever settings change (skip the initial default)
  const initialised = settings !== DEFAULT_SETTINGS;
  useEffect(() => {
    if (initialised) {
      persist(settings);
    }
  }, [settings, initialised]);

  const toggleDarkMode = useCallback(() => {
    setSettings((prev) => ({ ...prev, darkMode: !prev.darkMode }));
  }, []);

  const toggleErrorHighlighting = useCallback(() => {
    setSettings((prev) => ({ ...prev, errorHighlighting: !prev.errorHighlighting }));
  }, []);

  const toggleShowTimer = useCallback(() => {
    setSettings((prev) => ({ ...prev, showTimer: !prev.showTimer }));
  }, []);

  return {
    settings,
    toggleDarkMode,
    toggleErrorHighlighting,
    toggleShowTimer,
  };
}
