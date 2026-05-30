import RollHistory from './RollHistory';
import { getTheme, panelStyle } from '../utils/theme';

const XP_PER_LEVEL = 50;

const STAT_LABELS = { str: 'STR', agi: 'AGI', int: 'INT', fth: 'FTH' };

export default function HUD({ player, theme, kidMode = false, rollHistory = [], lastXpGained = 0 }) {
  const { name, className, hp, maxHp, stats, inventory, xp = 0, level = 1 } = player;
  const tc = getTheme(theme);

  const hpPct  = Math.max(0, (hp / maxHp) * 100);
  const xpPct  = Math.min(100, (xp / XP_PER_LEVEL) * 100);

  const hpColor = hpPct > 60 ? '#4ade80' : hpPct > 30 ? '#fbbf24' : '#f87171';

  const ps = panelStyle(tc, { kidMode });

  return (
    <div className="rounded-xl overflow-hidden" style={ps}>
      <div className="p-3.5 space-y-3">

        {/* ── Name + level ─────────────────────────── */}
        <div className="flex items-center gap-2.5">
          <span className="text-lg">{tc.icon}</span>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-sm text-stone-100 leading-tight truncate">{name}</p>
              <span
                className="shrink-0 text-xs font-bold px-1.5 py-0.5 rounded"
                style={{ background: `${tc.color}20`, border: `1px solid ${tc.color}50`, color: tc.color }}
              >
                Lv.{level}
              </span>
            </div>
            <p className="text-stone-600 text-xs">{className}</p>
          </div>
          {kidMode && (
            <span className="text-xs text-purple-400 font-bold">⭐ Kid</span>
          )}
        </div>

        {/* ── HP bar ─────────────────────────────────── */}
        <div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs uppercase tracking-wider" style={{ color: `${tc.color}60` }}>HP</span>
            <span className="text-xs font-bold" style={{ color: hpColor }}>{hp} / {maxHp}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${hpPct}%`, background: hpColor, boxShadow: `0 0 6px ${hpColor}60` }}
            />
          </div>
          {hpPct <= 30 && (
            <p className="text-red-500 text-xs mt-1 text-center animate-pulse">⚠ Critically wounded</p>
          )}
        </div>

        {/* ── XP bar ─────────────────────────────────── */}
        <div className="relative">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs uppercase tracking-wider" style={{ color: `${tc.color}60` }}>XP</span>
            <span className="text-xs" style={{ color: `${tc.color}50` }}>{xp} / {XP_PER_LEVEL}</span>
          </div>
          <div className="h-1 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${xpPct}%`, background: tc.color, boxShadow: `0 0 4px ${tc.color}50` }}
            />
          </div>
          {lastXpGained > 0 && (
            <span
              key={lastXpGained + Date.now()}
              className="xp-flash absolute -top-5 right-0 text-xs font-bold pointer-events-none"
              style={{ color: tc.color }}
            >
              +{lastXpGained} XP
            </span>
          )}
        </div>

        {/* ── Stats LOG ─────────────────────────────── */}
        <div className="grid grid-cols-4 gap-1">
          {Object.entries(stats).map(([key, val]) => (
            <div
              key={key}
              className="text-center py-1.5 rounded-lg"
              style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${tc.color}18` }}
            >
              <p className="text-xs uppercase leading-none" style={{ color: `${tc.color}60` }}>{key}</p>
              <p className="font-bold text-sm mt-0.5" style={{ color: tc.color }}>{val}</p>
            </div>
          ))}
        </div>

        {/* ── Roll history ───────────────────────────── */}
        <RollHistory rollHistory={rollHistory} themeColor={tc.color} />

        {/* ── Inventory ─────────────────────────────── */}
        {inventory.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wide mb-1.5" style={{ color: `${tc.color}50` }}>Inventory</p>
            <div className="flex flex-wrap gap-1">
              {inventory.map((item, i) => (
                <span
                  key={i}
                  className="text-xs px-2 py-0.5 rounded-full"
                  style={{ background: `${tc.color}12`, border: `1px solid ${tc.color}30`, color: `${tc.color}cc` }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
