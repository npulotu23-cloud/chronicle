import { useState } from 'react';

const STAT_LABELS = { str: 'Strength', agi: 'Agility', int: 'Intellect', fth: 'Faith' };
const STAT_ICONS  = { str: '⚔️', agi: '💨', int: '📖', fth: '✨' };
const POINTS_PER_LEVEL = 2;

export default function LevelUpModal({ level, stats, onConfirm }) {
  const [pending, setPending] = useState({ str: 0, agi: 0, int: 0, fth: 0 });
  const spent = Object.values(pending).reduce((a, b) => a + b, 0);
  const remaining = POINTS_PER_LEVEL - spent;

  function addPoint(stat) {
    if (remaining <= 0) return;
    setPending(p => ({ ...p, [stat]: p[stat] + 1 }));
  }

  function removePoint(stat) {
    if (pending[stat] <= 0) return;
    setPending(p => ({ ...p, [stat]: p[stat] - 1 }));
  }

  function handleConfirm() {
    if (remaining > 0) return;
    onConfirm(pending);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm fade-in">
      <div className="bg-stone-950 border border-amber-700 rounded-2xl p-6 w-full max-w-sm mx-4 shadow-2xl shadow-amber-900/30">

        {/* Header */}
        <div className="text-center mb-5">
          <p className="text-4xl mb-2">⬆</p>
          <h2 className="text-2xl font-bold gold-shimmer mb-1" style={{ fontFamily: 'Georgia, serif' }}>
            Level Up!
          </h2>
          <p className="text-stone-300 text-sm">
            You are now <span className="text-amber-400 font-bold">Level {level}</span>
          </p>
          <div className="mt-3 h-px bg-gradient-to-r from-transparent via-amber-800 to-transparent" />
        </div>

        {/* Points remaining badge */}
        <div className="text-center mb-4">
          <span className={`inline-block px-3 py-1 rounded-full text-sm font-bold border ${
            remaining > 0
              ? 'bg-amber-950/60 border-amber-700 text-amber-300'
              : 'bg-green-950/60 border-green-700 text-green-400'
          }`}>
            {remaining > 0 ? `${remaining} point${remaining > 1 ? 's' : ''} to distribute` : '✓ All points spent'}
          </span>
        </div>

        {/* Stat rows */}
        <div className="space-y-2 mb-5">
          {Object.entries(stats).map(([stat, currentVal]) => {
            const added = pending[stat];
            const newVal = currentVal + added;
            return (
              <div key={stat} className="flex items-center gap-3 bg-stone-900 rounded-xl px-3 py-2">
                <span className="text-base w-5 text-center">{STAT_ICONS[stat]}</span>
                <span className="text-stone-400 text-xs uppercase tracking-wide w-16">{STAT_LABELS[stat]}</span>

                <div className="flex items-center gap-1 ml-auto">
                  {/* Current value */}
                  <span className="text-stone-500 text-sm w-5 text-right">{currentVal}</span>

                  {/* Arrow + added */}
                  {added > 0 && (
                    <>
                      <span className="text-stone-600 text-xs">→</span>
                      <span className="text-amber-400 font-bold text-sm w-5">{newVal}</span>
                    </>
                  )}

                  {/* Controls */}
                  <div className="flex items-center gap-1 ml-2">
                    <button
                      onClick={() => removePoint(stat)}
                      disabled={added <= 0}
                      className={`w-6 h-6 rounded-md text-sm font-bold flex items-center justify-center transition-all
                        ${added > 0
                          ? 'bg-stone-700 hover:bg-stone-600 text-stone-200 cursor-pointer'
                          : 'bg-stone-800 text-stone-700 cursor-not-allowed'
                        }`}
                    >
                      −
                    </button>
                    <button
                      onClick={() => addPoint(stat)}
                      disabled={remaining <= 0}
                      className={`w-6 h-6 rounded-md text-sm font-bold flex items-center justify-center transition-all
                        ${remaining > 0
                          ? 'bg-amber-700 hover:bg-amber-600 text-amber-100 cursor-pointer hover:scale-110'
                          : 'bg-stone-800 text-stone-700 cursor-not-allowed'
                        }`}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Confirm */}
        <button
          onClick={handleConfirm}
          disabled={remaining > 0}
          className={`w-full py-3 rounded-xl font-bold tracking-wide text-sm transition-all duration-200
            ${remaining === 0
              ? 'bg-amber-700 hover:bg-amber-600 text-amber-100 cursor-pointer hover:scale-[1.02] shadow-lg shadow-amber-900/30'
              : 'bg-stone-800 text-stone-600 cursor-not-allowed'
            }`}
        >
          {remaining > 0 ? `Spend ${remaining} more point${remaining > 1 ? 's' : ''}` : 'Confirm & Continue'}
        </button>
      </div>
    </div>
  );
}
