import { useState } from 'react';

const STAT_COLORS = {
  str: 'text-red-400',
  agi: 'text-green-400',
  int: 'text-blue-400',
  fth: 'text-amber-400',
};

export default function RollHistory({ rollHistory }) {
  const [open, setOpen] = useState(false);

  if (!rollHistory || rollHistory.length === 0) return null;

  const last5 = rollHistory.slice(-5).reverse(); // most recent first

  return (
    <div className="border border-stone-800 rounded-xl overflow-hidden">
      {/* Toggle header */}
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 bg-stone-900 hover:bg-stone-800 transition-colors cursor-pointer"
      >
        <span className="text-stone-500 text-xs uppercase tracking-wide">Roll History</span>
        <span className="text-stone-600 text-xs">{open ? '▲' : '▼'} last {last5.length}</span>
      </button>

      {/* Roll list */}
      {open && (
        <div className="divide-y divide-stone-900">
          {last5.map((r, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 bg-stone-950 text-xs">
              {/* Result indicator */}
              <span className={`text-sm leading-none ${r.critSuccess ? 'text-amber-400' : r.critFail ? 'text-red-500' : r.success ? 'text-green-400' : 'text-stone-500'}`}>
                {r.critSuccess ? '✦' : r.critFail ? '✕' : r.success ? '✓' : '✗'}
              </span>

              {/* Roll breakdown */}
              <div className="flex-1 min-w-0">
                <p className="text-stone-400 truncate leading-tight">{r.label || 'Roll'}</p>
                <p className="text-stone-600 leading-tight">
                  <span className="text-stone-300 font-bold">{r.roll}</span>
                  <span className="text-stone-600"> +{r.bonus} = </span>
                  <span className={`font-bold ${r.success ? 'text-green-400' : 'text-red-400'}`}>{r.total}</span>
                  <span className="text-stone-700"> / DC{r.difficulty}</span>
                </p>
              </div>

              {/* Stat tag */}
              <span className={`uppercase font-bold text-xs ${STAT_COLORS[r.stat] || 'text-stone-500'}`}>
                {r.stat}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
