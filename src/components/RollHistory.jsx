import { useState } from 'react';

const STAT_COLORS = { str: '#f87171', agi: '#4ade80', int: '#60a5fa', fth: '#fbbf24' };

export default function RollHistory({ rollHistory, themeColor = '#C9A84C' }) {
  const [open, setOpen] = useState(false);

  if (!rollHistory || rollHistory.length === 0) return null;

  const last5 = rollHistory.slice(-5).reverse();

  return (
    <div className="rounded-lg overflow-hidden" style={{ border: `1px solid rgba(255,255,255,0.07)` }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-3 py-2 cursor-pointer transition-all"
        style={{ background: 'rgba(255,255,255,0.03)' }}
        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
        onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
      >
        <span className="text-xs uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Roll Log
        </span>
        <span className="text-xs" style={{ color: `${themeColor}50` }}>
          {open ? '▲' : '▼'} last {last5.length}
        </span>
      </button>

      {open && (
        <div>
          {last5.map((r, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-2 text-xs"
              style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
            >
              <span className="text-sm leading-none" style={{
                color: r.critSuccess ? themeColor : r.critFail ? '#f87171' : r.success ? '#4ade80' : 'rgba(255,255,255,0.3)'
              }}>
                {r.critSuccess ? '✦' : r.critFail ? '✕' : r.success ? '✓' : '✗'}
              </span>

              <div className="flex-1 min-w-0">
                <p className="text-stone-500 truncate leading-tight">{r.label || 'Roll'}</p>
                <p className="leading-tight" style={{ color: 'rgba(255,255,255,0.3)' }}>
                  <span className="font-bold" style={{ color: 'rgba(255,255,255,0.7)' }}>{r.roll}</span>
                  <span> +{r.bonus} = </span>
                  <span className="font-bold" style={{ color: r.success ? '#4ade80' : '#f87171' }}>{r.total}</span>
                  <span> / DC{r.difficulty}</span>
                </p>
              </div>

              <span className="font-bold uppercase text-xs" style={{ color: STAT_COLORS[r.stat] || themeColor }}>
                {r.stat}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
