const THEME_LABELS = {
  fantasy: 'Classic Fantasy',
  scifi: 'Sci-Fi / Space',
  biblical: 'Biblical Epic',
  polynesian: 'Polynesian Myth',
};
const THEME_ICONS = { fantasy: '⚔️', scifi: '🚀', biblical: '✡️', polynesian: '🌊' };

export default function HomeScreen({ saveData, onContinue, onNewGame }) {
  const { player, theme, kidMode, chapter = 1 } = saveData;
  const hpPct = Math.max(0, (player.hp / player.maxHp) * 100);
  const hpColor = hpPct > 60 ? 'text-green-400' : hpPct > 30 ? 'text-amber-400' : 'text-red-400';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-10 fade-in">
        <h1
          className="text-6xl font-bold tracking-widest mb-3 gold-shimmer"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          CHRONICLE
        </h1>
        <div className="h-px w-48 mx-auto bg-gradient-to-r from-transparent via-amber-700 to-transparent" />
      </div>

      {/* Save card */}
      <div className="w-full max-w-sm mb-8 fade-in">
        <p className="text-stone-600 text-xs uppercase tracking-widest text-center mb-3">
          Adventure in progress
        </p>
        <div className="bg-stone-950 border border-stone-700 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{THEME_ICONS[theme]}</span>
            <div>
              <p className="text-stone-100 font-bold text-base leading-tight">{player.name}</p>
              <p className="text-stone-500 text-xs">
                Level {player.level} {player.className} · {THEME_LABELS[theme]}
              </p>
            </div>
            {kidMode && (
              <span className="ml-auto text-xs bg-purple-900/60 border border-purple-700 text-purple-300 px-2 py-0.5 rounded-full font-bold">
                ⭐ Kid
              </span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2 text-xs text-center">
            <div className="bg-stone-900 rounded-lg py-2">
              <p className="text-stone-600 mb-0.5">Chapter</p>
              <p className="text-amber-400 font-bold">{chapter} / 3</p>
            </div>
            <div className="bg-stone-900 rounded-lg py-2">
              <p className="text-stone-600 mb-0.5">HP</p>
              <p className={`font-bold ${hpColor}`}>{player.hp}/{player.maxHp}</p>
            </div>
            <div className="bg-stone-900 rounded-lg py-2">
              <p className="text-stone-600 mb-0.5">Level</p>
              <p className="text-amber-400 font-bold">{player.level}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col gap-3 w-full max-w-sm fade-in">
        <button
          onClick={onContinue}
          className="w-full py-3.5 bg-amber-700 hover:bg-amber-600 text-amber-100 rounded-xl font-bold tracking-wide transition-all hover:scale-[1.02] cursor-pointer shadow-lg shadow-amber-900/30"
        >
          Continue Adventure →
        </button>
        <button
          onClick={onNewGame}
          className="w-full py-3 bg-stone-900 hover:bg-stone-800 border border-stone-700 text-stone-400 hover:text-stone-200 rounded-xl font-bold text-sm transition-all cursor-pointer"
        >
          New Game
        </button>
      </div>
    </div>
  );
}
