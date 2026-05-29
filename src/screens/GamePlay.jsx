import { useState, useEffect, useRef } from 'react';
import HUD from '../components/HUD';
import StoryPanel from '../components/StoryPanel';
import DiceRoller from '../components/DiceRoller';
import Choices from '../components/Choices';
import { startAdventure, continueAdventure, XP_PER_LEVEL } from '../api/narrator';
import LevelUpModal from '../components/LevelUpModal';

export default function GamePlay({ theme, player: initialPlayer, onRestart }) {
  const [player, setPlayer] = useState(initialPlayer);
  const [storyEntries, setStoryEntries] = useState([]);
  const [choices, setChoices] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [requiresRoll, setRequiresRoll] = useState(false);
  const [rollConfig, setRollConfig] = useState({ stat: 'str', difficulty: 12, reason: '' });
  const [pendingAction, setPendingAction] = useState(null);
  const [rollDone, setRollDone] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [victory, setVictory] = useState(false);
  const [error, setError] = useState(null);
  const [levelUpPending, setLevelUpPending] = useState(false);
  const historyRef = useRef([]);

  useEffect(() => {
    initAdventure();
  }, []);

  async function initAdventure() {
    setIsLoading(true);
    setError(null);
    try {
      const result = await startAdventure(theme, player);
      applyResult(result, null);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  function applyResult(result, actionText) {
    const newEntries = [];

    if (actionText) {
      newEntries.push({ type: 'action', text: actionText });
    }

    newEntries.push({ type: 'narrative', text: result.narrative });

    if (result.hpChange !== 0) {
      newEntries.push({ type: 'damage', value: result.hpChange });
    }

    if (result.itemFound) {
      newEntries.push({ type: 'item', text: result.itemFound });
    }

    if (result.xpGained > 0) {
      newEntries.push({ type: 'xp', value: result.xpGained });
    }

    setStoryEntries(prev => [...prev, ...newEntries]);

    setPlayer(prev => {
      const newHp = Math.min(prev.maxHp, Math.max(0, prev.hp + result.hpChange));
      const newInventory = result.itemFound ? [...prev.inventory, result.itemFound] : prev.inventory;

      const rawXp = (prev.xp || 0) + (result.xpGained || 0);
      const newLevel = (prev.level || 1) + Math.floor(rawXp / XP_PER_LEVEL);
      const newXp = rawXp % XP_PER_LEVEL;
      const didLevelUp = newLevel > (prev.level || 1);

      if (didLevelUp) setLevelUpPending(true);

      return { ...prev, hp: newHp, inventory: newInventory, xp: newXp, level: newLevel };
    });

    historyRef.current = [
      ...historyRef.current,
      { role: 'user', content: actionText || 'Begin the adventure.' },
      { role: 'assistant', content: result.rawAssistantMessage },
    ];

    if (result.gameOver) {
      setGameOver(true);
      return;
    }

    if (result.victory) {
      setVictory(true);
      return;
    }

    setChoices(result.choices || []);
    setRequiresRoll(result.requiresRoll || false);
    setRollConfig({
      stat: result.rollStat || 'str',
      difficulty: result.rollDifficulty || 12,
      reason: result.rollReason || '',
    });
    setPendingAction(null);
    setRollDone(false);
  }

  async function handleChoice(action) {
    if (isLoading) return;

    if (requiresRoll) {
      setPendingAction(action);
      setStoryEntries(prev => [...prev, { type: 'action', text: action }]);
      return;
    }

    await sendAction(action, null);
  }

  async function handleRoll(rollResult) {
    setRollDone(true);
    const actionText = pendingAction;

    const rollEntry = {
      type: 'roll',
      text: `Rolled ${rollResult.roll} + ${rollResult.bonus} (${rollResult.stat.toUpperCase()}) = ${rollResult.total} vs DC ${rollResult.difficulty}`,
      success: rollResult.success,
      critSuccess: rollResult.critSuccess,
      critFail: rollResult.critFail,
    };
    setStoryEntries(prev => [...prev, rollEntry]);

    setIsLoading(true);
    setError(null);
    try {
      const updatedPlayer = {
        ...player,
        hp: player.hp,
      };
      const result = await continueAdventure(theme, updatedPlayer, historyRef.current, actionText, rollResult);
      applyResult(result, null);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
      setRequiresRoll(false);
      setPendingAction(null);
    }
  }

  function handleLevelUp(pointsMap) {
    setPlayer(prev => ({
      ...prev,
      stats: {
        str: prev.stats.str + (pointsMap.str || 0),
        agi: prev.stats.agi + (pointsMap.agi || 0),
        int: prev.stats.int + (pointsMap.int || 0),
        fth: prev.stats.fth + (pointsMap.fth || 0),
      },
    }));
    setLevelUpPending(false);
  }

  async function sendAction(action, rollResult) {
    setIsLoading(true);
    setError(null);
    setChoices([]);
    try {
      const result = await continueAdventure(theme, player, historyRef.current, action, rollResult);
      applyResult(result, action);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  if (gameOver) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center fade-in max-w-lg">
          <p className="text-8xl mb-6">💀</p>
          <h2 className="text-5xl font-bold text-red-500 mb-3" style={{ fontFamily: 'Georgia, serif' }}>
            You Died
          </h2>
          <p className="text-stone-400 text-lg mb-2">{player.name} has fallen.</p>
          <p className="text-stone-600 text-sm mb-8 italic">
            {storyEntries.filter(e => e.type === 'narrative').slice(-1)[0]?.text}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={onRestart}
              className="px-6 py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl font-bold transition-all cursor-pointer hover:scale-105"
            >
              New Chronicle
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (victory) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center fade-in max-w-lg">
          <p className="text-8xl mb-6">👑</p>
          <h2 className="text-5xl font-bold mb-3 gold-shimmer" style={{ fontFamily: 'Georgia, serif' }}>
            Victory
          </h2>
          <p className="text-stone-300 text-lg mb-2">{player.name} has triumphed.</p>
          <p className="text-stone-500 text-sm mb-8 italic">
            {storyEntries.filter(e => e.type === 'narrative').slice(-1)[0]?.text}
          </p>
          <button
            onClick={onRestart}
            className="px-6 py-3 bg-amber-800 hover:bg-amber-700 text-amber-100 rounded-xl font-bold transition-all cursor-pointer hover:scale-105"
          >
            New Chronicle
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6">
      {levelUpPending && (
        <LevelUpModal
          level={player.level}
          stats={player.stats}
          onConfirm={handleLevelUp}
        />
      )}
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold tracking-widest gold-shimmer" style={{ fontFamily: 'Georgia, serif' }}>
            CHRONICLE
          </h1>
          <button
            onClick={onRestart}
            className="text-stone-600 hover:text-stone-400 text-xs uppercase tracking-wider cursor-pointer transition-colors"
          >
            ↩ Abandon
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left: HUD */}
          <div className="lg:col-span-1">
            <HUD player={player} theme={theme} />
          </div>

          {/* Right: Story + Controls */}
          <div className="lg:col-span-2 space-y-4">
            <StoryPanel entries={storyEntries} isLoading={isLoading} />

            {error && (
              <div className="bg-red-950/50 border border-red-800 rounded-xl p-3 text-red-400 text-sm">
                <strong>Error:</strong> {error}
                <button
                  onClick={() => { setError(null); initAdventure(); }}
                  className="ml-3 text-red-500 hover:text-red-300 underline cursor-pointer"
                >
                  Retry
                </button>
              </div>
            )}

            {requiresRoll && pendingAction && !rollDone && (
              <DiceRoller
                rollStat={rollConfig.stat}
                rollDifficulty={rollConfig.difficulty}
                rollReason={rollConfig.reason}
                playerStats={player.stats}
                onRoll={handleRoll}
                disabled={isLoading}
              />
            )}

            {!requiresRoll && !pendingAction && choices.length > 0 && !isLoading && (
              <Choices
                choices={choices}
                onChoose={handleChoice}
                disabled={isLoading}
              />
            )}

            {requiresRoll && !pendingAction && choices.length > 0 && !isLoading && (
              <Choices
                choices={choices}
                onChoose={handleChoice}
                disabled={isLoading}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
