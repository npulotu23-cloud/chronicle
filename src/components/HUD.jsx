const THEME_ICONS = { fantasy: '⚔️', scifi: '🚀', biblical: '✡️', polynesian: '🌊' };

export default function HUD({ player, theme }) {
  const { name, className, hp, maxHp, stats, inventory } = player;
  const hpPct = Math.max(0, (hp / maxHp) * 100);

  const hpColor =
    hpPct > 60 ? 'bg-green-500' :
    hpPct > 30 ? 'bg-amber-500' :
    'bg-red-600';

  const hpTextColor =
    hpPct > 60 ? 'text-green-400' :
    hpPct > 30 ? 'text-amber-400' :
    'text-red-400';

  const hpGlow =
    hpPct <= 30 ? 'shadow-red-900/50' : '';

  return (
    <div className="bg-stone-950 border border-stone-800 rounded-xl p-4 space-y-3">
      {/* Name & class */}
      <div className="flex items-center gap-2">
        <span className="text-xl">{THEME_ICONS[theme]}</span>
        <div>
          <p className="text-stone-100 font-bold text-sm leading-tight">{name}</p>
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
          <div
            className={`h-full rounded-full transition-all duration-500 ${hpColor}`}
            style={{ width: `${hpPct}%` }}
          />
        </div>
        {hpPct <= 30 && (
          <p className="text-red-500 text-xs mt-1 text-center animate-pulse">⚠ Critically wounded</p>
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
