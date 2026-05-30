import { useState, useEffect, useRef } from 'react';
import HUD from '../components/HUD';
import StoryPanel from '../components/StoryPanel';
import DiceRoller from '../components/DiceRoller';
import Choices from '../components/Choices';
import LevelUpModal from '../components/LevelUpModal';
import DeathRecap from '../components/DeathRecap';
import ChapterTransition from '../screens/ChapterTransition';
import { startAdventure, continueAdventure, XP_PER_LEVEL } from '../api/narrator';
import { saveGame, clearGame } from '../utils/save';

export default function GamePlay({ theme, player: initialPlayer, kidMode = false, savedGame = null, onRestart }) {
  // ── Core state (restored from save if available) ────────────────────────
  const sg = savedGame;
  const [player, setPlayer]             = useState(sg ? sg.player : initialPlayer);
  const [storyEntries, setStoryEntries] = useState(sg ? sg.storyEntries : []);
  const [choices, setChoices]           = useState(sg ? (sg.choices || []) : []);
  const [choiceStats, setChoiceStats]   = useState(sg ? (sg.choiceStats || []) : []);
  const [requiresRoll, setRequiresRoll] = useState(sg ? (sg.requiresRoll || false) : false);
  const [rollConfig, setRollConfig]     = useState(sg ? (sg.rollConfig || { stat: 'str', difficulty: 12, reason: '' }) : { stat: 'str', difficulty: 12, reason: '' });

  // ── Chapter state ────────────────────────────────────────────────────────
  const [chapter, setChapter]               = useState(sg ? (sg.chapter || 1) : 1);
  const [encounterCount, setEncounterCount] = useState(sg ? (sg.encounterCount || 0) : 0);
  const [chapterTransition, setChapterTransition] = useState(null);

  // ── Roll / death tracking ────────────────────────────────────────────────
  const [rollHistory, setRollHistory]   = useState(sg ? (sg.rollHistory || []) : []);
  const [turnCount, setTurnCount]       = useState(sg ? (sg.turnCount || 0) : 0);
  const [totalXpEarned, setTotalXpEarned] = useState(sg ? (sg.totalXpEarned || 0) : 0);
  const [causeOfDeath, setCauseOfDeath] = useState('');

  // ── UI state ─────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading]         = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [rollDone, setRollDone]           = useState(false);
  const [gameOver, setGameOver]           = useState(false);
  const [victory, setVictory]             = useState(false);
  const [error, setError]                 = useState(null);
  const [levelUpPending, setLevelUpPending] = useState(false);

  const historyRef = useRef(sg ? sg.history : []);

  // ── Start or restore ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!sg) initAdventure();
  }, []);

  // ── Auto-save after every meaningful state change ────────────────────────
  useEffect(() => {
    if (storyEntries.length === 0) return;
    if (gameOver || victory) return;
    saveGame({
      player, theme, kidMode,
      history: historyRef.current,
      storyEntries,
      choices,
      choiceStats,
      requiresRoll,
      rollConfig,
      chapter,
      encounterCount,
      rollHistory,
      turnCount,
      totalXpEarned,
    });
  }, [player, storyEntries, chapter, rollHistory]);

  // ────────────────────────────────────────────────────────────────────────
  async function initAdventure() {
    setIsLoading(true);
    setError(null);
    try {
      const playerWithCtx = { ...initialPlayer, chapter: 1, encounterCount: 0 };
      const result = await startAdventure(theme, playerWithCtx, kidMode);
      applyResult(result, null, { ch: 1, ec: 0, pl: initialPlayer });
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  // ────────────────────────────────────────────────────────────────────────
  // applyResult — called after EVERY Claude response.
  // ctx = { ch, ec, pl } lets us use fresh values before React batches the setState.
  // ────────────────────────────────────────────────────────────────────────
  function applyResult(result, actionText, ctx = null) {
    const currentChapter      = ctx ? ctx.ch : chapter;
    const currentEncounterCount = ctx ? ctx.ec : encounterCount;
    const currentPlayer       = ctx ? ctx.pl : player;

    const newEntries = [];

    if (actionText) newEntries.push({ type: 'action', text: actionText });

    // Boss indicator
    if (result.bossEncounter) newEntries.push({ type: 'boss' });

    newEntries.push({ type: 'narrative', text: result.narrative });

    // Kid-mode knockout intercept
    const wouldDie = result.gameOver || (currentPlayer.hp + result.hpChange) <= 0;
    const isKidKnockout = kidMode && wouldDie;

    if (isKidKnockout) {
      newEntries.push({ type: 'knockout' });
    } else if (result.hpChange !== 0) {
      newEntries.push({ type: 'damage', value: result.hpChange });
    }

    if (result.itemFound) newEntries.push({ type: 'item', text: result.itemFound });
    if (result.xpGained > 0) newEntries.push({ type: 'xp', value: result.xpGained });

    setStoryEntries(prev => [...prev, ...newEntries]);

    // Update player HP, inventory, XP, level
    setPlayer(prev => {
      let newHp;
      if (isKidKnockout) {
        newHp = Math.max(1, Math.floor(prev.maxHp / 2));
      } else {
        newHp = Math.min(prev.maxHp, Math.max(0, prev.hp + result.hpChange));
      }
      const newInventory = result.itemFound ? [...prev.inventory, result.itemFound] : prev.inventory;
      const rawXp = (prev.xp || 0) + (result.xpGained || 0);
      const newLevel = (prev.level || 1) + Math.floor(rawXp / XP_PER_LEVEL);
      const newXp = rawXp % XP_PER_LEVEL;
      if (newLevel > (prev.level || 1)) setLevelUpPending(true);
      return { ...prev, hp: newHp, inventory: newInventory, xp: newXp, level: newLevel };
    });

    // Track total XP and turn count
    setTotalXpEarned(prev => prev + (result.xpGained || 0));
    if (actionText) setTurnCount(prev => prev + 1);

    // Increment encounter counter
    const newEncounterCount = currentEncounterCount + 1;
    setEncounterCount(newEncounterCount);

    // Update conversation history
    historyRef.current = [
      ...historyRef.current,
      { role: 'user', content: actionText || 'Begin the adventure.' },
      { role: 'assistant', content: result.rawAssistantMessage },
    ];

    // ── Game over ──
    if (result.gameOver && !kidMode) {
      setCauseOfDeath(result.narrative);
      clearGame();
      setGameOver(true);
      return;
    }

    // ── Victory ──
    if (result.victory) {
      clearGame();
      setVictory(true);
      return;
    }

    // ── Chapter complete (Ch1 or Ch2 only) ──
    if (result.chapterComplete && currentChapter < 3) {
      setChapterTransition({
        number: currentChapter + 1,
        title: result.chapterTitle || '',
        description: result.chapterDescription || '',
      });
      // Fall through to set choices (available after player dismisses transition)
    }

    // Set choices for next action
    setChoices(result.choices || []);
    setChoiceStats(result.choiceStats || [null, null, null]);
    setRequiresRoll(result.requiresRoll || false);
    setRollConfig({
      stat: result.rollStat || 'str',
      difficulty: result.rollDifficulty || 12,
      reason: result.rollReason || '',
    });
    setPendingAction(null);
    setRollDone(false);
  }

  // ────────────────────────────────────────────────────────────────────────
  function handleChapterContinue() {
    const newChapter = chapter + 1;
    setStoryEntries(prev => [
      ...prev,
      { type: 'chapter_header', chapter: newChapter, title: chapterTransition.title },
    ]);
    setChapter(newChapter);
    setEncounterCount(0);
    setChapterTransition(null);
  }

  // ────────────────────────────────────────────────────────────────────────
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

    // Record roll in history
    const rollEntry = {
      label: rollConfig.reason,
      roll: rollResult.roll,
      bonus: rollResult.bonus,
      stat: rollResult.stat,
      total: rollResult.total,
      difficulty: rollResult.difficulty,
      success: rollResult.success,
      critSuccess: rollResult.critSuccess,
      critFail: rollResult.critFail,
    };
    setRollHistory(prev => [...prev, rollEntry]);

    setStoryEntries(prev => [...prev, {
      type: 'roll',
      text: `Rolled ${rollResult.roll} + ${rollResult.bonus} (${rollResult.stat.toUpperCase()}) = ${rollResult.total} vs DC ${rollResult.difficulty}`,
      success: rollResult.success,
      critSuccess: rollResult.critSuccess,
      critFail: rollResult.critFail,
    }]);

    setIsLoading(true);
    setError(null);
    try {
      const playerWithCtx = { ...player, chapter, encounterCount };
      const result = await continueAdventure(theme, playerWithCtx, historyRef.current, actionText, rollResult, kidMode);
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
      const playerWithCtx = { ...player, chapter, encounterCount };
      const result = await continueAdventure(theme, playerWithCtx, historyRef.current, action, rollResult, kidMode);
      applyResult(result, action);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  // ── Render: death recap ──────────────────────────────────────────────────
  if (gameOver) {
    return (
      <DeathRecap
        player={player}
        theme={theme}
        chapter={chapter}
        turnCount={turnCount}
        rollHistory={rollHistory}
        causeOfDeath={causeOfDeath}
        totalXpEarned={totalXpEarned}
        onNewGame={onRestart}
      />
    );
  }

  // ── Render: victory ──────────────────────────────────────────────────────
  if (victory) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center fade-in max-w-lg">
          <p className="text-8xl mb-6">👑</p>
          <h2 className="text-5xl font-bold mb-3 gold-shimmer" style={{ fontFamily: 'Georgia, serif' }}>
            Victory
          </h2>
          <p className="text-stone-300 text-lg mb-2">{player.name} has triumphed.</p>
          <p className="text-stone-500 text-sm mb-4">
            Level {player.level} · {turnCount} turns · {totalXpEarned} XP earned
          </p>
          <p className="text-stone-600 text-sm mb-8 italic" style={{ fontFamily: 'Georgia, serif' }}>
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

  // ── Render: chapter transition ───────────────────────────────────────────
  if (chapterTransition) {
    return (
      <ChapterTransition
        chapter={chapterTransition.number}
        title={chapterTransition.title}
        description={chapterTransition.description}
        theme={theme}
        onContinue={handleChapterContinue}
      />
    );
  }

  // ── Render: main game ────────────────────────────────────────────────────
  return (
    <div className="min-h-screen p-4 md:p-6">
      {levelUpPending && (
        <LevelUpModal level={player.level} stats={player.stats} onConfirm={handleLevelUp} />
      )}

      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold tracking-widest gold-shimmer" style={{ fontFamily: 'Georgia, serif' }}>
              CHRONICLE
            </h1>
            <span className="text-stone-700 text-xs uppercase tracking-wide hidden sm:inline">
              Ch.{chapter}/3 · Turn {turnCount}
            </span>
          </div>
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
            <HUD player={player} theme={theme} kidMode={kidMode} rollHistory={rollHistory} />
          </div>

          {/* Right: Story + Controls */}
          <div className="lg:col-span-2 space-y-4">
            <StoryPanel entries={storyEntries} isLoading={isLoading} />

            {error && (
              <div className="bg-red-950/50 border border-red-800 rounded-xl p-3 text-red-400 text-sm">
                <strong>Error:</strong> {error}
                <button
                  onClick={() => { setError(null); if (!sg) initAdventure(); }}
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

            {!pendingAction && choices.length > 0 && !isLoading && (
              <Choices
                choices={choices}
                choiceStats={choiceStats}
                requiresRoll={requiresRoll}
                theme={theme}
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
