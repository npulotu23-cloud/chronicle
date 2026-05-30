import { useState } from 'react';
import ThemeSelect from './screens/ThemeSelect';
import ClassSelect from './screens/ClassSelect';
import GamePlay from './screens/GamePlay';
import HomeScreen from './screens/HomeScreen';
import { loadGame, clearGame, hasSave } from './utils/save';

const BASE_STATS = { str: 2, agi: 2, int: 2, fth: 2 };

function buildPlayer(name, classData) {
  return {
    name,
    className: classData.name,
    classId: classData.id,
    hp: classData.hp,
    maxHp: classData.hp,
    stats: { ...BASE_STATS, ...classData.stats },
    inventory: [],
    xp: 0,
    level: 1,
  };
}

export default function App() {
  const [screen, setScreen] = useState(() => hasSave() ? 'home' : 'theme');
  const [theme, setTheme]     = useState(null);
  const [kidMode, setKidMode] = useState(false);
  const [player, setPlayer]   = useState(null);
  const [savedGame, setSavedGame] = useState(null);

  function handleContinue() {
    const save = loadGame();
    if (!save) { setScreen('theme'); return; }
    setTheme(save.theme);
    setKidMode(save.kidMode || false);
    setPlayer(save.player);
    setSavedGame(save);
    setScreen('game');
  }

  function handleNewGame() {
    clearGame();
    setSavedGame(null);
    setScreen('theme');
  }

  function handleThemeSelect({ themeId, kidMode: km }) {
    setTheme(themeId);
    setKidMode(km);
    setScreen('class');
  }

  function handleClassSelect({ classData, name }) {
    const p = buildPlayer(name, classData);
    setPlayer(p);
    setSavedGame(null);
    setScreen('game');
  }

  function handleRestart() {
    clearGame();
    setTheme(null);
    setKidMode(false);
    setPlayer(null);
    setSavedGame(null);
    setScreen('theme');
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {screen === 'home'  && <HomeScreen saveData={loadGame()} onContinue={handleContinue} onNewGame={handleNewGame} />}
      {screen === 'theme' && <ThemeSelect onSelect={handleThemeSelect} />}
      {screen === 'class' && <ClassSelect theme={theme} onSelect={handleClassSelect} />}
      {screen === 'game'  && player && (
        <GamePlay
          theme={theme}
          player={player}
          kidMode={kidMode}
          savedGame={savedGame}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
