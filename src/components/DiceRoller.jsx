import { useState } from 'react';
import { getTheme, panelStyle } from '../utils/theme';

export default function DiceRoller({ rollStat, rollDifficulty, rollReason, playerStats, onRoll, disabled, theme, kidMode = false }) {
  const [rolling, setRolling] = useState(false);
  const [displayNum, setDisplayNum] = useState(null);
  const [result, setResult] = useState(null);

  const tc      = getTheme(theme);
  const bonus   = Math.max(0, (playerStats[rollStat] || 2) - 2);
  const ps      = panelStyle(tc, { kidMode, intense: true });

  const handleRoll = () => {
    if (rolling || disabled) return;
    setRolling(true);
    setResult(null);

    const finalRoll  = Math.floor(Math.random() * 20) + 1;
    const total      = finalRoll + bonus;
    const success    = total >= rollDifficulty;
    const critSuccess = finalRoll === 20;
    const critFail   = finalRoll === 1;

    let frame = 0;
    const frames = 16;
    const interval = setInterval(() => {
      setDisplayNum(Math.floor(Math.random() * 20) + 1);
      frame++;
      if (frame >= frames) {
        clearInterval(interval);
        setDisplayNum(finalRoll);
        setRolling(false);
        const rollResult = {
          roll: finalRoll, stat: rollStat, bonus, total,
          difficulty: rollDifficulty, success,
          critical: critSuccess || critFail, critSuccess, critFail,
        };
        setResult(rollResult);
        onRoll(rollResult);
      }
    }, 45);
  };

  const diffLabel = rollDifficulty <= 8 ? 'Easy' : rollDifficulty <= 12 ? 'Medium' : rollDifficulty <= 16 ? 'Hard' : 'Legendary';

  const resultStyle = result
    ? result.critSuccess ? { background: `${tc.color}18`, border: `1px solid ${tc.color}60`, color: tc.color }
    : result.critFail    ? { background: 'rgba(200,20,20,0.18)', border: '1px solid rgba(200,20,20,0.5)', color: '#f87171' }
    : result.success     ? { background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.35)', color: '#4ade80' }
    : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#78716c' }
    : {};

  const canRoll = !disabled && !rolling && !result;

  return (
    <div className="rounded-xl overflow-hidden" style={ps}>
      <div className="p-4 space-y-3">

        {/* Header */}
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.3em] font-bold mb-1" style={{ color: tc.color }}>
            Dice Check Required
          </p>
          <p className="text-stone-400 text-sm">{rollReason}</p>
          <div className="flex justify-center gap-5 mt-2 text-xs" style={{ color: `${tc.color}60` }}>
            <span>Stat: <span className="font-bold uppercase" style={{ color: tc.color }}>{rollStat}</span></span>
            <span>+{bonus} bonus</span>
            <span>DC {rollDifficulty} · <span style={{ color: tc.color }}>{diffLabel}</span></span>
          </div>
        </div>

        {/* Die button */}
        <button
          onClick={handleRoll}
          disabled={!canRoll}
          className={`
            w-full flex flex-col items-center justify-center gap-1
            py-5 rounded-xl transition-all duration-200 font-bold
            ${canRoll ? 'cursor-pointer hover:scale-[1.03] active:scale-[0.97]' : 'cursor-not-allowed'}
            ${rolling ? 'die-pulse' : ''}
          `}
          style={canRoll ? {
            background: `${tc.color}10`,
            border: `1.5px solid ${tc.color}50`,
            boxShadow: `0 0 20px ${tc.color}20, 0 0 50px ${tc.color}08`,
          } : {
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <span
            className={`text-6xl select-none leading-none ${rolling ? 'spin-die inline-block' : ''}`}
            style={{ filter: canRoll ? `drop-shadow(0 0 8px ${tc.color}60)` : 'none' }}
          >
            🎲
          </span>
          <span
            className="text-4xl font-mono font-black leading-none mt-1"
            style={{ color: displayNum ? tc.color : 'rgba(255,255,255,0.15)' }}
          >
            {displayNum || '?'}
          </span>
          {canRoll && (
            <span className="text-xs uppercase tracking-widest mt-1" style={{ color: `${tc.color}70` }}>
              Click to Roll D20
            </span>
          )}
        </button>

        {/* Result */}
        {result && (
          <div className="rounded-lg p-3 text-center text-sm font-bold story-text" style={resultStyle}>
            {result.critSuccess && <p>✦ Critical Success! Rolled 20 + {bonus} = {result.total}</p>}
            {result.critFail    && <p>✕ Critical Fail! Rolled 1 — catastrophe strikes.</p>}
            {!result.critSuccess && !result.critFail && (
              <p>
                {result.success ? '✓' : '✗'} Rolled {result.roll} + {bonus} = {result.total} vs DC {rollDifficulty} — {result.success ? 'Success' : 'Failure'}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
