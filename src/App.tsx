import React, { useState, useEffect } from 'react';
import { GameMode, ClassicConfig, GameSessionResult } from './types/game';
import { UserSettings } from './types/stats';
import { StorageService } from './storage/storage';
import { sound } from './audio/soundEngine';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { HomeScreen } from './components/screens/HomeScreen';
import { ResultsScreen } from './components/screens/ResultsScreen';
import { StatsScreen } from './components/screens/StatsScreen';
import { StickersScreen } from './components/screens/StickersScreen';
import { DailyChallengeScreen } from './components/screens/DailyChallengeScreen';
import { ClassicArithmetic } from './components/games/ClassicArithmetic';
import { NumberNinja } from './components/games/NumberNinja';
import { TimesTablePlayground } from './components/games/TimesTablePlayground';
import { FractionFrenzy } from './components/games/FractionFrenzy';
import { NumberSense } from './components/games/NumberSense';
import { Target100 } from './components/games/Target100';
import { OperatorBlitz } from './components/games/OperatorBlitz';
import { ExamMode } from './components/games/ExamMode';
import { MentalCalculus } from './components/games/MentalCalculus';
import { MentalAlgebra } from './components/games/MentalAlgebra';
import { SettingsModal } from './components/modals/SettingsModal';

export const App: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings>(() => StorageService.getSettings());
  const [currentTab, setCurrentTab] = useState<'home' | 'arcade' | 'daily' | 'stats' | 'stickers'>('home');
  const [activeGame, setActiveGame] = useState<GameMode | null>(null);
  const [gamePreset, setGamePreset] = useState<Partial<ClassicConfig> | undefined>(undefined);
  const [lastResult, setLastResult] = useState<GameSessionResult | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Sync sound engine state
  useEffect(() => {
    sound.setEnabled(settings.soundEnabled);
  }, []);

  // Sync theme to root class and mobile status bar
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('theme-cream', 'theme-midnight', 'theme-mint', 'theme-lavender', 'theme-blueprint', 'dark');

    const themeColorMeta = document.getElementById('theme-color-meta');
    const statusBarMeta = document.getElementById('status-bar-meta');

    if (settings.theme === 'midnight' || settings.theme === 'blueprint') {
      root.classList.add('dark');
      if (settings.theme === 'blueprint') {
        root.classList.add('theme-blueprint');
      }
      const darkBg = settings.theme === 'blueprint' ? '#0B1A32' : '#0B0F19';
      if (themeColorMeta) themeColorMeta.setAttribute('content', darkBg);
      if (statusBarMeta) statusBarMeta.setAttribute('content', 'black-translucent');
    } else {
      root.classList.add(`theme-${settings.theme}`);
      const lightBg = settings.theme === 'mint' ? '#ECF7F0' : '#FAF7EE';
      if (themeColorMeta) themeColorMeta.setAttribute('content', lightBg);
      if (statusBarMeta) statusBarMeta.setAttribute('content', 'default');
    }
  }, [settings.theme]);

  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
  };

  const handleResetData = () => {
    StorageService.resetAllData();
    setSettings(StorageService.getSettings());
    setLastResult(null);
    sound.playClick();
  };

  const handleStartGame = (mode: GameMode, preset?: Partial<ClassicConfig>) => {
    setLastResult(null);
    setGamePreset(preset);
    setActiveGame(mode);
  };

  const handleFinishGame = (result: GameSessionResult) => {
    // Record in local storage and check for new badges / personal records
    const { isNewPersonalBest, newlyUnlockedBadges } = StorageService.recordSession(result);

    const enrichedResult: GameSessionResult = {
      ...result,
      isPersonalBest: isNewPersonalBest,
      unlockedBadges: newlyUnlockedBadges.map((b) => b.title),
    };

    setLastResult(enrichedResult);
    setActiveGame(null);
  };

  const handleExitGame = () => {
    sound.playClick();
    setActiveGame(null);
    setLastResult(null);
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const isDailyDoneToday = StorageService.isDailyCompleted(todayStr);
  const isDarkTheme = settings.theme === 'midnight' || settings.theme === 'blueprint';

  return (
    <div className="min-h-screen flex flex-col paper-pattern">
      {/* Persistent Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => {
          sound.playClick();
          setActiveGame(null);
          setLastResult(null);
          setCurrentTab(tab);
        }}
        onStartZetamac={() => {
          sound.playClick();
          handleStartGame('classic', { duration: 60, difficulty: 'medium', autoStart: true });
        }}
        soundEnabled={settings.soundEnabled}
        onToggleSound={() => {
          const next = !settings.soundEnabled;
          sound.setEnabled(next);
          handleUpdateSettings({ ...settings, soundEnabled: next });
        }}
        isDark={settings.theme === 'midnight' || settings.theme === 'blueprint'}
        onToggleDark={() => {
          sound.playClick();
          const currentlyDark = settings.theme === 'midnight' || settings.theme === 'blueprint';
          const nextTheme = currentlyDark ? 'cream' : 'midnight';
          handleUpdateSettings({ ...settings, theme: nextTheme });
        }}
        onOpenSettings={() => {
          sound.playClick();
          setIsSettingsOpen(true);
        }}
        isDailyDoneToday={isDailyDoneToday}
      />

      {/* Main Container */}
      <main className="flex-1 w-full">
        {/* Results Screen View */}
        {lastResult && !activeGame && (
          <ResultsScreen
            result={lastResult}
            onPlayAgain={() => {
              sound.playClick();
              setActiveGame(lastResult.mode);
              setLastResult(null);
            }}
            onBackToArcade={() => {
              sound.playClick();
              setLastResult(null);
              setActiveGame(null);
              setCurrentTab('home');
            }}
          />
        )}

        {/* Active Game Views */}
        {!lastResult && activeGame === 'classic' && (
          <ClassicArithmetic
            initialPreset={gamePreset}
            onFinish={handleFinishGame}
            onExit={handleExitGame}
            alwaysShowKeypad={settings.showOnScreenKeypad}
          />
        )}

        {!lastResult && activeGame === 'ninja' && (
          <NumberNinja
            onFinish={handleFinishGame}
            onExit={handleExitGame}
            alwaysShowKeypad={settings.showOnScreenKeypad}
          />
        )}

        {!lastResult && activeGame === 'timestables' && (
          <TimesTablePlayground
            onFinish={handleFinishGame}
            onExit={handleExitGame}
            alwaysShowKeypad={settings.showOnScreenKeypad}
          />
        )}

        {!lastResult && activeGame === 'fractions' && (
          <FractionFrenzy
            onFinish={handleFinishGame}
            onExit={handleExitGame}
            alwaysShowKeypad={settings.showOnScreenKeypad}
          />
        )}

        {!lastResult && activeGame === 'numbersense' && (
          <NumberSense
            onFinish={handleFinishGame}
            onExit={handleExitGame}
            alwaysShowKeypad={settings.showOnScreenKeypad}
          />
        )}

        {!lastResult && activeGame === 'calculus' && (
          <MentalCalculus
            onFinish={handleFinishGame}
            onExit={handleExitGame}
            alwaysShowKeypad={settings.showOnScreenKeypad}
          />
        )}

        {!lastResult && activeGame === 'algebra' && (
          <MentalAlgebra
            onFinish={handleFinishGame}
            onExit={handleExitGame}
            alwaysShowKeypad={settings.showOnScreenKeypad}
          />
        )}

        {!lastResult && activeGame === 'target100' && (
          <Target100
            onFinish={handleFinishGame}
            onExit={handleExitGame}
          />
        )}

        {!lastResult && activeGame === 'operators' && (
          <OperatorBlitz
            onFinish={handleFinishGame}
            onExit={handleExitGame}
          />
        )}

        {!lastResult && activeGame === 'exam' && (
          <ExamMode
            onFinish={handleFinishGame}
            onExit={handleExitGame}
            alwaysShowKeypad={settings.showOnScreenKeypad}
          />
        )}

        {!lastResult && activeGame === 'daily' && (
          <DailyChallengeScreen
            onFinish={handleFinishGame}
            onExit={handleExitGame}
            alwaysShowKeypad={settings.showOnScreenKeypad}
          />
        )}

        {/* Top-Level Tab Views (when not playing a game) */}
        {!lastResult && !activeGame && (
          <>
            {currentTab === 'home' && (
              <HomeScreen
                onStartGame={handleStartGame}
                onOpenDaily={() => setCurrentTab('daily')}
                onOpenStats={() => setCurrentTab('stats')}
                onOpenStickers={() => setCurrentTab('stickers')}
                isDark={isDarkTheme}
              />
            )}

            {currentTab === 'daily' && (
              <DailyChallengeScreen
                onFinish={handleFinishGame}
                onExit={() => setCurrentTab('home')}
                alwaysShowKeypad={settings.showOnScreenKeypad}
              />
            )}

            {currentTab === 'stats' && (
              <StatsScreen onBack={() => setCurrentTab('home')} />
            )}

            {currentTab === 'stickers' && (
              <StickersScreen onBack={() => setCurrentTab('home')} />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onResetAllData={handleResetData}
      />
    </div>
  );
};
