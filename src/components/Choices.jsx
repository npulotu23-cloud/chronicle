import { useState } from 'react';
import { getTheme, panelStyle } from '../utils/theme';

const STAT_COLORS = {
  str: '#f87171',
  agi: '#4ade80',
  int: '#60a5fa',
  fth: '#fbbf24',
};

function StatTag({ stat, themeColor }) {
  if (!stat) return null;
  const color = STAT_COLORS[stat] || themeColor;
  return (
    <span
      className="shrink-0 text-xs font-bold uppercase px-1.5 py-0.5 rounded"
      style={{
        background: `${color}18`,
        border: `1px solid ${color}50`,
        color,
        textShadow: `0 0 6px ${color}60`,
      }}
    >
      {stat}
    </span>
  );
}

export default function Choices({ choices, choiceStats = [], onChoose, disabled, theme, kidMode = false }) {
  const [custom, setCustom] = useState('');
  const tc = getTheme(theme);
  const ps = panelStyle(tc, { kidMode });

  const handleCustom = () => {
    if (!custom.trim() || disabled) return;
    onChoose(custom.trim(), -1);
    setCustom('');
  };

  return (
    <div className="rounded-xl overflow-hidden" style={ps}>
      <div className="p-3.5 space-y-2">
        <p className="text-xs uppercase tracking-[0.3em] text-center mb-2" style={{ color: `${tc.color}50` }}>
          What do you do?
        </p>

        {/* Preset choices */}
        <div className="space-y-1.5">
          {choices.map((choice, i) => {
            const stat = choiceStats[i] || null;
            return (
              <button
                key={i}
                onClick={() => !disabled && onChoose(choice, i)}
                disabled={disabled}
                className="w-full text-left px-3.5 py-2.5 rounded-lg text-sm transition-all duration-200 flex items-center justify-between gap-2 group"
                style={disabled ? {
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: 'rgba(255,255,255,0.25)',
                  cursor: 'not-allowed',
                } : {
                  background: 'rgba(255,255,255,0.04)',
                  border: `1px solid rgba(255,255,255,0.09)`,
                  color: '#d6d3d1',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  if (!disabled) {
                    e.currentTarget.style.background = `${tc.color}12`;
                    e.currentTarget.style.border = `1px solid ${tc.color}40`;
                    e.currentTarget.style.color = '#f5f5f4';
                  }
                }}
                onMouseLeave={e => {
                  if (!disabled) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                    e.currentTarget.style.border = '1px solid rgba(255,255,255,0.09)';
                    e.currentTarget.style.color = '#d6d3d1';
                  }
                }}
              >
                <span className="flex-1">
                  <span className="mr-2" style={{ color: `${tc.color}50` }}>{i + 1}.</span>
                  {choice}
                </span>
                {stat && <StatTag stat={stat} themeColor={tc.color} />}
              </button>
            );
          })}
        </div>

        {/* Free-type input */}
        <div className="flex gap-2 pt-1">
          <input
            type="text"
            value={custom}
            onChange={(e) => setCustom(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleCustom()}
            disabled={disabled}
            placeholder="Or type your own action..."
            className="flex-1 text-sm text-stone-300 placeholder-stone-700 focus:outline-none rounded-lg px-3.5 py-2 transition-all disabled:opacity-40"
            style={{
              background: 'rgba(0,0,0,0.4)',
              border: `1px solid rgba(255,255,255,0.08)`,
            }}
            onFocus={e => { e.target.style.border = `1px solid ${tc.color}40`; }}
            onBlur={e => { e.target.style.border = '1px solid rgba(255,255,255,0.08)'; }}
          />
          <button
            onClick={handleCustom}
            disabled={disabled || !custom.trim()}
            className="px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200"
            style={!disabled && custom.trim() ? {
              background: `${tc.color}20`,
              border: `1px solid ${tc.color}50`,
              color: tc.color,
              cursor: 'pointer',
            } : {
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.06)',
              color: 'rgba(255,255,255,0.2)',
              cursor: 'not-allowed',
            }}
          >
            Act
          </button>
        </div>
      </div>
    </div>
  );
}
