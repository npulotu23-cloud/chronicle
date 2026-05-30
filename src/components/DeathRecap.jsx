import { getTheme, panelStyle } from '../utils/theme';

const STAT_COLORS = {
  str: '#f87171', agi: '#4ade80', int: '#60a5fa', fth: '#fbbf24',
};

export default function DeathRecap({
  player, theme, chapter, turnCount, rollHistory,
  causeOfDeath, totalXpEarned, onNewGame,
}) {
  const tc = getTheme(theme);
  const ps = panelStyle(tc);

  const allRolls  = rollHistory || [];
  const bestRoll  = allRolls.length ? allRolls.reduce((a, b) => b.total > a.total ? b : a) : null;
  const worstRoll = allRolls.length ? allRolls.reduce((a, b) => b.total < a.total ? b : a) : null;

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-10 fade-in">
      {/* Dark atmospheric background */}
      <div className="fixed inset-0 z-0 bg-cover bg-center"
           style={{ backgroundImage: `url(${tc.bgUrl})`, backgroundColor: '#050508' }} />
      <div className="fixed inset-0 z-[1]" style={{ background: 'rgba(0,0,0,0.88)' }} />
      {/* Red vignette */}
      <div className="fixed inset-0 z-[2] pointer-events-none"
           style={{ background: 'radial-gradient(ellipse at center, rgba(120,0,0,0.2) 0%, transparent 70%)' }} />

      <div className="relative z-10 w-full max-w-sm">
        {/* Top line */}
        <div className="h-px w-32 mx-auto mb-8 bg-gradient-to-r from-transparent via-red-800 to-transparent" />

        {/* Skull + title */}
        <div className="text-center mb-6">
          <p className="text-6xl mb-4" style={{ filter: 'drop-shadow(0 0 12px rgba(200,20,20,0.6))' }}>💀</p>
          <h2 className="text-5xl font-bold mb-1" style={{ fontFamily: 'Georgia, serif', color: '#f87171', textShadow: '0 0 20px rgba(248,113,113,0.5)' }}>
            Fallen
          </h2>
          <p className="text-stone-500 text-sm">{player.name} has passed into shadow.</p>
        </div>

        {/* Cause of death quote */}
        {causeOfDeath && (
          <p className="text-stone-600 text-xs italic text-center mb-6 leading-relaxed px-2" style={{ fontFamily: 'Georgia, serif' }}>
            "{causeOfDeath.slice(0, 160)}{causeOfDeath.length > 160 ? '…' : ''}"
          </p>
        )}

        {/* Stats panel */}
        <div className="mb-5 rounded-xl overflow-hidden" style={ps}>
          <div className="p-4">
            <p className="text-xs uppercase tracking-widest text-center mb-3" style={{ color: `${tc.color}60` }}>
              The Chronicle of {player.name}
            </p>

            <div className="grid grid-cols-2 gap-2 mb-3">
              {[
                ['Turns Survived', turnCount],
                ['Chapter Reached', `${chapter} / 3`],
                ['Total XP', totalXpEarned],
                ['Level', player.level],
              ].map(([label, val]) => (
                <div key={label} className="text-center py-2 rounded-lg"
                     style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${tc.color}18` }}>
                  <p className="text-xs mb-0.5" style={{ color: `${tc.color}50` }}>{label}</p>
                  <p className="font-bold text-stone-200">{val}</p>
                </div>
              ))}
            </div>

            {/* Roll records */}
            {bestRoll && (
              <div className="rounded-lg p-3 mb-2"
                   style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                <p className="text-xs uppercase tracking-wide mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
                  Roll Records
                </p>
                <div className="flex justify-between text-xs gap-3">
                  <div className="flex-1">
                    <p className="text-stone-600 mb-0.5">Best</p>
                    <p className="font-bold" style={{ color: '#4ade80' }}>
                      {bestRoll.roll}+{bestRoll.bonus}={bestRoll.total}
                      <span className="ml-1 uppercase text-xs" style={{ color: STAT_COLORS[bestRoll.stat] }}>
                        ({bestRoll.stat})
                      </span>
                    </p>
                    <p className="text-stone-700 text-xs italic truncate">{bestRoll.label}</p>
                  </div>
                  {worstRoll && worstRoll.total !== bestRoll.total && (
                    <div className="flex-1 text-right">
                      <p className="text-stone-600 mb-0.5">Worst</p>
                      <p className="font-bold" style={{ color: '#f87171' }}>
                        {worstRoll.roll}+{worstRoll.bonus}={worstRoll.total}
                        <span className="ml-1 uppercase text-xs" style={{ color: STAT_COLORS[worstRoll.stat] }}>
                          ({worstRoll.stat})
                        </span>
                      </p>
                      <p className="text-stone-700 text-xs italic truncate">{worstRoll.label}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="rounded-lg p-3"
                 style={{ background: 'rgba(200,20,20,0.1)', border: '1px solid rgba(200,20,20,0.3)' }}>
              <p className="text-xs mb-1" style={{ color: 'rgba(248,113,113,0.5)' }}>Cause of Death</p>
              <p className="text-red-400 text-xs">
                {player.name} fell in <span className="font-bold">Chapter {chapter}</span> of the{' '}
                <span className="font-bold">{tc.label}</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="h-px w-32 mx-auto mb-6 bg-gradient-to-r from-transparent via-red-800 to-transparent" />

        <button
          onClick={onNewGame}
          className="w-full py-3 rounded-xl font-bold tracking-wide text-sm transition-all cursor-pointer hover:scale-[1.02]"
          style={{
            background: 'rgba(200,20,20,0.15)',
            border: '1px solid rgba(200,20,20,0.45)',
            color: '#f87171',
            boxShadow: '0 0 20px rgba(200,20,20,0.15)',
          }}
          onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 30px rgba(200,20,20,0.3)'}
          onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(200,20,20,0.15)'}
        >
          Begin a New Chronicle
        </button>
      </div>
    </div>
  );
}
