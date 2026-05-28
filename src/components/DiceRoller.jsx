import { useState } from 'react';

const D20_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

export default function DiceRoller({ rollStat, rollDifficulty, rollReason, playerStats, onRoll, disabled }) {
  const [rolling, setRolling] = useState(false);
  const [displayNum, setDisplayNum] = useState(null);
  const [result, setResult] = useState(null);

  const bonus = Math.max(0, (playerStats[rollStat] || 2) - 2);

  const handleRoll = () => {
    if (rolling || disabled) return;
    setRolling(true);
    setResult(null);

    const finalRoll = Math.floor(Math.random() * 20) + 1;
    const total = finalRoll + bonus;
    const success = total >= rollDifficulty;
    const critSuccess = finalRoll === 20;
    const critFail = finalRoll === 1;

    let frame = 0;
    const frames = 14;
    const interval = setInterval(() => {
      setDisplayNum(Math.floor(Math.random() * 20) + 1);
      frame++;
      if (frame >= frames) {
        clearInterval(interval);
        setDisplayNum(finalRoll);
        setRolling(false);
        const rollResult = { roll: finalRoll, stat: rollStat, bonus, total, difficulty: rollDifficulty, success, critical: critSuccess || critFail, critSuccess, critFail };
        setResult(rollResult);
        onRoll(rollResult);
      }
    }, 50);
  };

  const resultColor = result
    ? result.critSuccess ? 'text-amber-400 border-amber-600 bg-amber-950/40'
    : result.critFail ? 'text-red-400 border-red-700 bg-red-950/40'
    : result.success ? 'text-green-400 border-green-700 bg-green-950/40'
    : 'text-stone-400 border-stone-700 bg-stone-900'
    : '';

  const diffLabel =
    rollDifficulty <= 8 ? 'Easy' :
    rollDifficulty <= 12 ? 'Medium' :
    rollDifficulty <= 16 ? 'Hard' :
    'Legendary';

  return (
    <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-3">
      <div className="text-center">
        <p className="text-amber-500 text-xs uppercase tracking-widest font-bold mb-1">Dice Check Required</p>
        <p className="text-stone-400 text-sm">{rollReason}</p>
        <div className="flex justify-center gap-4 mt-2 text-xs text-stone-600">
          <span>Stat: <span className="text-stone-400 uppercase font-bold">{rollStat}</span></span>
          <span>Bonus: <span className="text-amber-500 font-bold">+{bonus}</span></span>
          <span>DC: <span className="text-stone-400 font-bold">{rollDifficulty}</span> ({diffLabel})</span>
        </div>
      </div>

      <button
        onClick={handleRoll}
        disabled={disabled || rolling || !!result}
        className={`
          w-full flex flex-col items-center justify-center gap-1
          py-4 rounded-xl border-2 transition-all duration-200 font-bold
          ${disabled || result
            ? 'border-stone-800 bg-stone-900 text-stone-700 cursor-not-allowed'
            : rolling
            ? 'border-amber-700 bg-amber-950/30 cursor-wait'
            : 'border-amber-700 bg-amber-950/20 hover:bg-amber-950/40 hover:border-amber-500 cursor-pointer hover:scale-[1.02] active:scale-95'
          }
        `}
      >
        <span className={`text-5xl select-none ${rolling ? 'spin-die inline-block' : ''}`}>
          🎲
        </span>
        <span className={`text-3xl font-mono font-bold ${displayNum ? 'text-amber-300' : 'text-stone-600'}`}>
          {displayNum || '?'}
        </span>
        {!result && !rolling && (
          <span className="text-amber-600 text-xs uppercase tracking-widest">Click to Roll D20</span>
        )}
      </button>

      {result && (
        <div className={`border rounded-lg p-3 text-center text-sm font-bold ${resultColor} story-text`}>
          {result.critSuccess && <p>✦ Critical Success! Rolled 20 + {bonus} = {result.total}</p>}
          {result.critFail && <p>✕ Critical Fail! Rolled 1 — catastrophe strikes.</p>}
          {!result.critSuccess && !result.critFail && (
            <p>
              {result.success ? '✓' : '✗'} Rolled {result.roll} + {bonus} = {result.total} vs DC {rollDifficulty} — {result.success ? 'Success' : 'Failure'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
