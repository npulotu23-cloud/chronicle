import { useState, useEffect, useRef } from 'react';
import HUD from '../components/HUD';
import StoryPanel from '../components/StoryPanel';
import DiceRoller from '../components/DiceRoller';
import Choices from '../components/Choices';
import LevelUpModal from '../components/LevelUpModal';
import DeathRecap from '../components/DeathRecap';
import CritFlash from '../components/CritFlash';
import ChapterTransition from '../screens/ChapterTransition';
import { startAdventure, continueAdventure, XP_PER_LEVEL } from '../api/narrator';
import { saveGame, clearGame } from '../utils/save';
import { getTheme, panelStyle, glowText } from '../utils/theme';

// ── First-person ground element ─────────────────────────────────────────
function FirstPersonGround() {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-[3] pointer-events-none select-none">
      {/* Gradient shadow rising from the bottom */}
      <div style={{ height: '80px', background: 'linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%)' }} />
      {/* SVG arm silhouettes */}
      <svg
        viewBox="0 0 800 90"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="none"
        style={{ width: '100%', height: '72px', display: 'block', marginTop: '-4px' }}
      >
        {/* Left arm */}
        <path d="M0,90 L0,52 C25,38 65,40 105,52 C135,60 165,76 195,90 Z" fill="rgba(0,0,0,0.92)" />
        {/* Right arm */}
        <path d="M800,90 L800,52 C775,38 735,40 695,52 C665,60 635,76 605,90 Z" fill="rgba(0,0,0,0.92)" />
        {/* Ground strip */}
        <path d="M175,90 C220,78 310,72 400,70 C490,72 580,78 625,90 Z" fill="rgba(0,0,0,0.80)" />
        {/* Full bottom fill */}
        <rect x="0" y="82" width="800" height="8" fill="rgba(0,0,0,0.95)" />
      </svg>
    </div>
  );
}

// ────────────────────────────────────────────────────────────────────────
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
  const [chapter, setChapter]                     = useState(sg ? (sg.chapter || 1) : 1);
  const [encounterCount, setEncounterCount]       = useState(sg ? (sg.encounterCount || 0) : 0);
  const [chapterTransition, setChapterTransition] = useState(null);

  // ── Roll / death tracking ────────────────────────────────────────────────
  const [rollHistory, setRollHistory]     = useState(sg ? (sg.rollHistory || []) : []);
  const [turnCount, setTurnCount]         = useState(sg ? (sg.turnCount || 0) : 0);
  const [totalXpEarned, setTotalXpEarned] = useState(sg ? (sg.totalXpEarned || 0) : 0);
  const [causeOfDeath, setCauseOfDeath]   = useState('');

  // ── UI state ─────────────────────────────────────────────────────────────
  const [isLoading, setIsLoading]                           = useState(false);
  const [pendingAction, setPendingAction]                   = useState(null);
  const [pendingActionIsCustom, setPendingActionIsCustom]   = useState(false);
  const [rollDone, setRollDone]                             = useState(false);
  const [gameOver, setGameOver]                             = useState(false);
  const [victory, setVictory]                               = useState(false);
  const [error, setError]                                   = useState(null);
  const [levelUpPending, setLevelUpPending]                 = useState(false);
  const [xpFlash, setXpFlash]                               = useState(0);
  // ── Visual-only state ─────────────────────────────────────────────────
  const [critFlash, setCritFlash]   = useState(null); // null | 'success' | 'fail'

  const historyRef       = useRef(sg ? sg.history : []);
  const xpFlashTimerRef  = useRef(null);
  const critFlashTimerRef = useRef(null);

  // Theme config (visual only)
  const tc = getTheme(theme);

  // ── Start or restore ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!sg) initAdventure();
    return () => {
      clearTimeout(xpFlashTimerRef.current);
      clearTimeout(critFlashTimerRef.current);
    };
  }, []);

  // ── Auto-save ────────────────────────────────────────────────────────────
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
  function applyResult(result, actionText, ctx = null, rollMeta = null) {
    const currentChapter        = ctx ? ctx.ch : chapter;
    const currentEncounterCount = ctx ? ctx.ec : encounterCount;
    const currentPlayer         = ctx ? ctx.pl : player;

    const newEntries = [];

    if (actionText) newEntries.push({ type: 'action', text: actionText });
    if (result.bossEncounter) newEntries.push({ type: 'boss' });

    newEntries.push({ type: 'narrative', text: result.narrative });

    if (result.criticalEffect) {
      newEntries.push({
        type: 'crit_effect',
        text: result.criticalEffect,
        positive: rollMeta?.critSuccess === true,
      });
    }

    const wouldDie      = result.gameOver || (currentPlayer.hp + result.hpChange) <= 0;
    const isKidKnockout = kidMode && wouldDie;

    if (isKidKnockout) {
      newEntries.push({ type: 'knockout' });
    } else if (result.hpChange !== 0) {
      newEntries.push({ type: 'damage', value: result.hpChange });
    }

    if (result.itemFound) newEntries.push({ type: 'item', text: result.itemFound });

    if (result.xpGained > 0) {
      newEntries.push({ type: 'xp', value: result.xpGained });
      setXpFlash(result.xpGained);
      clearTimeout(xpFlashTimerRef.current);
      xpFlashTimerRef.current = setTimeout(() => setXpFlash(0), 2500);
    }

    setStoryEntries(prev => [...prev, ...newEntries]);

    setPlayer(prev => {
      let newHp;
      if (isKidKnockout) {
        newHp = Math.max(1, Math.floor(prev.maxHp / 2));
      } else {
        newHp = Math.min(prev.maxHp, Math.max(0, prev.hp + result.hpChange));
      }
      const newInventory = result.itemFound ? [...prev.inventory, result.itemFound] : prev.inventory;
      const rawXp  = (prev.xp || 0) + (result.xpGained || 0);
      const newLevel = (prev.level || 1) + Math.floor(rawXp / XP_PER_LEVEL);
      const newXp  = rawXp % XP_PER_LEVEL;
      if (newLevel > (prev.level || 1)) setLevelUpPending(true);
      return { ...prev, hp: newHp, inventory: newInventory, xp: newXp, level: newLevel };
    });

    setTotalXpEarned(prev => prev + (result.xpGained || 0));
    if (actionText) setTurnCount(prev => prev + 1);
    setEncounterCount(currentEncounterCount + 1);

    historyRef.current = [
      ...historyRef.current,
      { role: 'user', content: actionText || 'Begin the adventure.' },
      { role: 'assistant', content: result.rawAssistantMessage },
    ];

    if (result.gameOver && !kidMode) {
      setCauseOfDeath(result.narrative);
      clearGame();
      setGameOver(true);
      return;
    }

    if (result.victory) {
      clearGame();
      setVictory(true);
      return;
    }

    if (result.chapterComplete && currentChapter < 3) {
      setChapterTransition({
        number: currentChapter + 1,
        title: result.chapterTitle || '',
        description: result.chapterDescription || '',
      });
    }

    setChoices(result.choices || []);
    const sanitizedChoiceStats = result.requiresRoll
      ? (result.choiceStats || [null, null, null])
      : [null, null, null];
    setChoiceStats(sanitizedChoiceStats);
    setRequiresRoll(result.requiresRoll || false);
    setRollConfig({
      stat: result.rollStat || 'str',
      difficulty: result.rollDifficulty || 12,
      reason: result.rollReason || '',
    });
    setPendingAction(null);
    setPendingActionIsCustom(false);
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
  async function handleChoice(action, choiceIndex = -1) {
    if (isLoading) return;
    const isCustom = choiceIndex === -1;

    if (requiresRoll) {
      if (!isCustom && choiceIndex >= 0) {
        const taggedStat = choiceStats[choiceIndex];
        if (taggedStat && taggedStat !== rollConfig.stat) {
          console.warn(
            `[Chronicle] Stat mismatch on choice ${choiceIndex}: ` +
            `choiceStats="${taggedStat}" overrides rollStat="${rollConfig.stat}". Using choiceStats value.`
          );
          setRollConfig(prev => ({ ...prev, stat: taggedStat }));
        }
      }
      setPendingAction(action);
      setPendingActionIsCustom(isCustom);
      setStoryEntries(prev => [...prev, { type: 'action', text: action }]);
      return;
    }

    await sendAction(action, null);
  }

  // ────────────────────────────────────────────────────────────────────────
  async function handleRoll(rollResult) {
    setRollDone(true);
    const actionText = pendingAction;

    // ── Visual: trigger crit flash ──
    if (rollResult.critSuccess) {
      setCritFlash('success');
      clearTimeout(critFlashTimerRef.current);
      critFlashTimerRef.current = setTimeout(() => setCritFlash(null), 1500);
    } else if (rollResult.critFail) {
      setCritFlash('fail');
      clearTimeout(critFlashTimerRef.current);
      critFlashTimerRef.current = setTimeout(() => setCritFlash(null), 1500);
    }

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
      const result = await continueAdventure(
        theme, playerWithCtx, historyRef.current, actionText, rollResult, kidMode
      );
      applyResult(result, null, null, {
        critSuccess: rollResult.critSuccess,
        critFail: rollResult.critFail,
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
      setRequiresRoll(false);
      setPendingAction(null);
    }
  }

  // ────────────────────────────────────────────────────────────────────────
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

  // ────────────────────────────────────────────────────────────────────────
  async function sendAction(action, rollResult) {
    setIsLoading(true);
    setError(null);
    setChoices([]);
    try {
      const playerWithCtx = { ...player, chapter, encounterCount };
      const result = await continueAdventure(
        theme, playerWithCtx, historyRef.current, action, rollResult, kidMode
      );
      applyResult(result, action);
    } catch (e) {
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  }

  // ── Shared background layers ─────────────────────────────────────────────
  const BgLayers = () => (
    <>
      <div className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
           style={{ backgroundImage: `url(${tc.bgUrl})`, backgroundColor: '#050508' }} />
      <div className="fixed inset-0 z-[1]" style={{ background: tc.overlayColor }} />
    </>
  );

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
      <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <BgLayers />
        <div className="relative z-10 text-center fade-in max-w-lg">
          <p className="text-7xl mb-5" style={{ filter: `drop-shadow(0 0 16px ${tc.color})` }}>👑</p>
          <h2 className="text-5xl font-bold mb-3" style={{ fontFamily: 'Georgia, serif', color: tc.color, ...glowText(tc.color, 1.4) }}>
            Victory
          </h2>
          <p className="text-stone-300 text-base mb-1">{player.name} has triumphed.</p>
          <p className="text-stone-600 text-sm mb-4">
            Level {player.level} · {turnCount} turns · {totalXpEarned} XP earned
          </p>
          <p className="text-stone-600 text-xs mb-8 italic" style={{ fontFamily: 'Georgia, serif' }}>
            {storyEntries.filter(e => e.type === 'narrative').slice(-1)[0]?.text}
          </p>
          <button
            onClick={onRestart}
            className="px-6 py-3 rounded-xl font-bold tracking-wide text-sm transition-all cursor-pointer hover:scale-[1.03]"
            style={{
              background: `${tc.color}22`,
              border: `1px solid ${tc.color}55`,
              color: tc.color,
              boxShadow: `0 0 24px ${tc.color}18`,
            }}
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
  const headerPanelStyle = {
    background: 'rgba(0,0,0,0.55)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: `1px solid ${tc.color}20`,
  };

  return (
    <div className="relative min-h-screen">
      {/* Fixed background layers */}
      <BgLayers />
      {/* First person ground */}
      <FirstPersonGround />
      {/* Critical flash overlay */}
      <CritFlash type={critFlash} themeColor={tc.color} />
      {/* Level up modal */}
      {levelUpPending && (
        <LevelUpModal level={player.level} stats={player.stats} onConfirm={handleLevelUp} />
      )}

      {/* Scrollable game content */}
      <div className="relative z-10 min-h-screen p-3 md:p-5 pb-32">
        <div className="max-w-4xl mx-auto">

          {/* Header bar */}
          <div className="flex items-center justify-between mb-3 px-3 py-2 rounded-xl" style={headerPanelStyle}>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold tracking-widest gold-shimmer" style={{ fontFamily: 'Georgia, serif' }}>
                CHRONICLE
              </h1>
              <span className="hidden sm:inline text-xs uppercase tracking-wider" style={{ color: `${tc.color}40` }}>
                Ch.{chapter}/3 · Turn {turnCount}
              </span>
            </div>
            <button
              onClick={onRestart}
              className="text-xs uppercase tracking-wider transition-colors cursor-pointer"
              style={{ color: 'rgba(255,255,255,0.25)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.55)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.25)'}
            >
              ↩ Abandon
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
            {/* Left: HUD */}
            <div className="lg:col-span-1">
              <HUD
                player={player}
                theme={theme}
                kidMode={kidMode}
                rollHistory={rollHistory}
                lastXpGained={xpFlash}
              />
            </div>

            {/* Right: Story + Controls */}
            <div className="lg:col-span-2 space-y-3">
              <StoryPanel
                entries={storyEntries}
                isLoading={isLoading}
                theme={theme}
                kidMode={kidMode}
              />

              {error && (
                <div className="rounded-xl p-3 text-sm"
                     style={{ background: 'rgba(200,20,20,0.15)', border: '1px solid rgba(200,20,20,0.35)', color: '#f87171' }}>
                  <strong>Error:</strong> {error}
                  <button
                    onClick={() => { setError(null); if (!sg) initAdventure(); }}
                    className="ml-3 underline cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Stat explanation for free-typed actions on roll turn */}
              {requiresRoll && pendingAction && !rollDone && pendingActionIsCustom && rollConfig.reason && (
                <div
                  className="rounded-xl px-4 py-2.5 text-sm italic"
                  style={{
                    background: `${tc.color}08`,
                    border: `1px solid ${tc.color}25`,
                    color: 'rgba(255,255,255,0.55)',
                  }}
                >
                  This calls for a{' '}
                  <span className="font-bold not-italic uppercase" style={{ color: tc.color }}>
                    {rollConfig.stat}
                  </span>
                  {' '}roll — {rollConfig.reason}
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
                  theme={theme}
                  kidMode={kidMode}
                />
              )}

              {!pendingAction && choices.length > 0 && !isLoading && (
                <Choices
                  choices={choices}
                  choiceStats={choiceStats}
                  requiresRoll={requiresRoll}
                  onChoose={handleChoice}
                  disabled={isLoading}
                  theme={theme}
                  kidMode={kidMode}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
