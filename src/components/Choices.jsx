import { useState } from 'react';

const STAT_TAG_STYLES = {
  str: 'bg-red-950/70 border-red-800 text-red-400',
  agi: 'bg-green-950/70 border-green-800 text-green-400',
  int: 'bg-blue-950/70 border-blue-800 text-blue-400',
  fth: 'bg-amber-950/70 border-amber-800 text-amber-400',
};

function StatTag({ stat }) {
  if (!stat) return null;
  return (
    <span className={`shrink-0 border text-xs font-bold uppercase px-1.5 py-0.5 rounded ml-2 ${STAT_TAG_STYLES[stat] || 'bg-stone-800 border-stone-700 text-stone-400'}`}>
      {stat}
    </span>
  );
}

export default function Choices({ choices, choiceStats = [], onChoose, disabled }) {
  const [custom, setCustom] = useState('');

  const handleCustom = () => {
    if (!custom.trim() || disabled) return;
    onChoose(custom.trim());
    setCustom('');
  };

  return (
    <div className="space-y-3">
      <p className="text-stone-600 text-xs uppercase tracking-widest text-center">What do you do?</p>

      <div className="space-y-2">
        {choices.map((choice, i) => {
          const stat = choiceStats[i] || null;
          return (
            <button
              key={i}
              onClick={() => !disabled && onChoose(choice)}
              disabled={disabled}
              className={`
                w-full text-left px-4 py-3 rounded-xl border text-sm transition-all duration-200
                flex items-center justify-between gap-2
                ${disabled
                  ? 'border-stone-800 bg-stone-900 text-stone-600 cursor-not-allowed'
                  : 'border-stone-700 bg-stone-900/80 text-stone-300 hover:border-amber-700 hover:bg-amber-950/20 hover:text-stone-100 cursor-pointer hover:scale-[1.01]'
                }
              `}
            >
              <span>
                <span className="text-stone-600 mr-2">{i + 1}.</span>
                {choice}
              </span>
              {stat && <StatTag stat={stat} />}
            </button>
          );
        })}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleCustom()}
          disabled={disabled}
          placeholder="Or type your own action..."
          className="flex-1 bg-stone-900 border border-stone-800 rounded-xl px-4 py-2.5 text-sm text-stone-300 placeholder-stone-700 focus:outline-none focus:border-amber-700 disabled:opacity-50 transition-colors"
        />
        <button
          onClick={handleCustom}
          disabled={disabled || !custom.trim()}
          className={`
            px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-200
            ${disabled || !custom.trim()
              ? 'bg-stone-800 text-stone-600 cursor-not-allowed'
              : 'bg-amber-800 hover:bg-amber-700 text-amber-100 cursor-pointer hover:scale-[1.02]'
            }
          `}
        >
          Act
        </button>
      </div>
    </div>
  );
}
