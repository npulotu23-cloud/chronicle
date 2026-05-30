import { getTheme, panelStyle, glowText } from '../utils/theme';

export default function HomeScreen({ saveData, onContinue, onNewGame }) {
  const { player, theme, kidMode, chapter = 1 } = saveData;
  const tc = getTheme(theme);

  const hpPct  = Math.max(0, (player.hp / player.maxHp) * 100);
  const hpColor = hpPct > 60 ? '#4ade80' : hpPct > 30 ? '#fbbf24' : '#f87171';

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-10">
      {/* Background */}
      <div className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
           style={{ backgroundImage: `url(${tc.bgUrl})`, backgroundColor: '#050508' }} />
      <div className="fixed inset-0 z-[1]" style={{ background: tc.overlayColor }} />

      <div className="relative z-10 w-full max-w-sm">
        {/* Title */}
        <div className="text-center mb-8 rise-1">
          <h1 className="text-6xl font-bold tracking-widest gold-shimmer" style={{ fontFamily: 'Georgia, serif' }}>
            CHRONICLE
          </h1>
          <div className="h-px mt-3 mx-auto w-32" style={{ background: `linear-gradient(90deg, transparent, ${tc.color}, transparent)` }} />
        </div>

        {/* Save card */}
        <div className="mb-6 rise-2" style={panelStyle(tc, { kidMode })}>
          <div className="p-4">
            <p className="text-xs uppercase tracking-widest text-center mb-3" style={{ color: `${tc.color}80` }}>
              Adventure in progress
            </p>

            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{tc.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-bold text-sm text-stone-100 truncate">{player.name}</p>
                  {kidMode && (
                    <span className="text-xs bg-purple-900/60 border border-purple-700 text-purple-300 px-1.5 py-0.5 rounded-full shrink-0">⭐ Kid</span>
                  )}
                </div>
                <p className="text-stone-500 text-xs">Lv.{player.level} {player.className} · {tc.label}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs text-center mb-3">
              {[
                ['Chapter', `${chapter}/3`],
                ['HP',      `${player.hp}/${player.maxHp}`],
                ['Level',   player.level],
              ].map(([label, val]) => (
                <div key={label} className="rounded-lg py-2" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${tc.color}20` }}>
                  <p className="text-stone-600 mb-0.5">{label}</p>
                  <p className="font-bold" style={{ color: label === 'HP' ? hpColor : tc.color }}>{val}</p>
                </div>
              ))}
            </div>

            {/* HP bar */}
            <div className="h-1 bg-black/40 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${hpPct}%`, background: hpColor }} />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 rise-3">
          <button
            onClick={onContinue}
            className="w-full py-3.5 rounded-xl font-bold tracking-wide text-sm transition-all hover:scale-[1.02] cursor-pointer active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${tc.color}30, ${tc.color}18)`,
              border: `1px solid ${tc.color}60`,
              color: tc.color,
              boxShadow: `0 0 20px ${tc.color}20`,
              ...glowText(tc.color, 0.5),
            }}
          >
            Continue Adventure →
          </button>
          <button
            onClick={onNewGame}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all cursor-pointer hover:text-stone-200"
            style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.4)',
            }}
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}
