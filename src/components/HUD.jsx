import RollHistory from './RollHistory';

const THEME_ICONS = { fantasy: '⚔️', scifi: '🚀', biblical: '✡️', polynesian: '🌊' };
const XP_PER_LEVEL = 50;

export default function HUD({ player, theme, kidMode = false, rollHistory = [], lastXpGained = 0 }) {
  const { name, className, hp, maxHp, stats, inventory, xp = 0, level = 1 } = player;
  const hpPct = Math.max(0, (hp / maxHp) * 100);
  const xpPct = Math.min(100, (xp / XP_PER_LEVEL) * 100);

  const hpColor     = hpPct > 60 ? 'bg-green-500'  : hpPct > 30 ? 'bg-amber-500'  : 'bg-red-600';
  const hpTextColor = hpPct > 60 ? 'text-green-400' : hpPct > 30 ? 'text-amber-400' : 'text-red-400';
  const hpGlow      = hpPct <= 30 ? 'shadow-red-900/50' : '';

  return (
    <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-3">
      {/* Name & class */}
      <div className="flex items-center gap-2">
        <span className="text-xl">{THEME_ICONS[theme]}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-stone-100 font-bold text-sm leading-tight truncate">{name}</p>
            <span className="shrink-0 bg-amber-900/60 border border-amber-700 text-amber-400 text-xs font-bold px-1.5 py-0.5 rounded-md">
              Lv.{level}
            </span>
          </div>
          <p className="text-stone-500 text-xs">{className}</p>
        </div>
      </div>

      {/* HP bar */}
      <div>
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-stone-500 uppercase tracking-wide">HP</span>
          <span className={`text-xs font-bold ${hpTextColor}`}>{hp} / {maxHp}</span>
        </div>
        <div className={`h-2 bg-stone-800 rounded-full overflow-hidden shadow-inner ${hpPct <= 30 ? `shadow-lg ${hpGlow}` : ''}`}>
          <div className={`h-full rounded-full transition-all duration-500 ${hpColor}`} style={{ width: `${hpPct}%` }} />
        </div>
        {hpPct <= 30 && (
          <p className="text-red-500 text-xs mt-1 text-center animate-pulse">⚠ Critically wounded</p>
        )}
      </div>

      {/* XP bar */}
      <div className="relative">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-stone-500 uppercase tracking-wide">XP</span>
          <span className="text-xs text-stone-500">{xp} / {XP_PER_LEVEL}</span>
        </div>
        <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
          <div className="h-full rounded-full bg-amber-600 transition-all duration-700" style={{ width: `${xpPct}%` }} />
        </div>
        {lastXpGained > 0 && (
          <span
            key={lastXpGained + '-' + Date.now()}
            className="xp-flash absolute -top-5 right-0 text-amber-400 text-xs font-bold pointer-events-none"
          >
            +{lastXpGained} XP
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-1">
        {Object.entries(stats).map(([key, val]) => (
          <div key={key} className="bg-stone-900 rounded-lg p-1.5 text-center">
            <p className="text-stone-500 text-xs uppercase leading-none">{key}</p>
            <p className="text-amber-400 font-bold text-sm mt-0.5">{val}</p>
          </div>
        ))}
      </div>

      {/* Kid Mode badge */}
      {kidMode && (
        <div className="flex items-center gap-1.5 bg-purple-950/60 border border-purple-700 rounded-lg px-2.5 py-1.5">
          <span className="text-sm">⭐</span>
          <span className="text-purple-300 text-xs font-bold tracking-wide">Kid Mode</span>
        </div>
      )}

      {/* Roll history (collapsible) */}
      <RollHistory rollHistory={rollHistory} />

      {/* Inventory */}
      {inventory.length > 0 && (
        <div>
          <p className="text-stone-600 text-xs uppercase tracking-wide mb-1.5">Inventory</p>
          <div className="flex flex-wrap gap-1.5">
            {inventory.map((item, i) => (
              <span key={i} className="bg-stone-800 border border-stone-700 text-stone-300 text-xs px-2 py-0.5 rounded-full">
                {item}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
