const THEME_LABELS = {
  fantasy: 'Classic Fantasy',
  scifi: 'Sci-Fi / Space',
  biblical: 'Biblical Epic',
  polynesian: 'Polynesian Myth',
};

const STAT_COLORS = {
  str: 'text-red-400', agi: 'text-green-400', int: 'text-blue-400', fth: 'text-amber-400',
};

export default function DeathRecap({
  player, theme, chapter, turnCount, rollHistory,
  causeOfDeath, totalXpEarned, onNewGame,
}) {
  const allRolls = rollHistory || [];
  const bestRoll  = allRolls.length ? allRolls.reduce((a, b) => b.total > a.total ? b : a) : null;
  const worstRoll = allRolls.length ? allRolls.reduce((a, b) => b.total < a.total ? b : a) : null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 fade-in">
      {/* Top atmospheric line */}
      <div className="h-px w-48 mb-10 bg-gradient-to-r from-transparent via-red-900 to-transparent" />

      {/* Skull */}
      <p className="text-7xl mb-5 opacity-80">💀</p>

      <h2
        className="text-5xl font-bold text-red-500 mb-1"
        style={{ fontFamily: 'Georgia, serif' }}
      >
        Fallen
      </h2>
      <p className="text-stone-500 text-base mb-2">{player.name} has passed into shadow.</p>

      {causeOfDeath && (
        <p
          className="text-stone-600 text-sm italic max-w-md text-center mb-8 leading-relaxed"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          "{causeOfDeath}"
        </p>
      )}

      {/* Stats grid */}
      <div className="w-full max-w-sm space-y-2 mb-8">
        <p className="text-stone-600 text-xs uppercase tracking-widest text-center mb-3">
          The Chronicle of {player.name}
        </p>

        <div className="grid grid-cols-2 gap-2">
          <StatCell label="Turns Survived" value={turnCount} />
          <StatCell label="Chapter Reached" value={`${chapter} of 3`} />
          <StatCell label="Total XP Earned" value={totalXpEarned} />
          <StatCell label="Level Achieved" value={player.level} />
        </div>

        {/* Roll records */}
        {bestRoll && (
          <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-3 mt-1">
            <p className="text-stone-600 text-xs uppercase tracking-wide mb-2">Roll Records</p>
            <div className="flex justify-between text-xs">
              <div>
                <p className="text-stone-500 mb-0.5">Best Roll</p>
                <p className="text-green-400 font-bold">
                  {bestRoll.roll}
                  <span className="text-stone-500 font-normal"> +{bestRoll.bonus} </span>
                  = {bestRoll.total}
                  <span className={`ml-1 uppercase ${STAT_COLORS[bestRoll.stat]}`}>({bestRoll.stat})</span>
                </p>
                <p className="text-stone-600 text-xs italic truncate max-w-[140px]">{bestRoll.label}</p>
              </div>
              {worstRoll && worstRoll.total !== bestRoll.total && (
                <div className="text-right">
                  <p className="text-stone-500 mb-0.5">Worst Roll</p>
                  <p className="text-red-400 font-bold">
                    {worstRoll.roll}
                    <span className="text-stone-500 font-normal"> +{worstRoll.bonus} </span>
                    = {worstRoll.total}
                    <span className={`ml-1 uppercase ${STAT_COLORS[worstRoll.stat]}`}>({worstRoll.stat})</span>
                  </p>
                  <p className="text-stone-600 text-xs italic truncate max-w-[140px]">{worstRoll.label}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* What killed them */}
        <div className="bg-red-950/30 border border-red-900/50 rounded-xl p-3">
          <p className="text-stone-600 text-xs uppercase tracking-wide mb-1">Cause of Death</p>
          <p className="text-red-400 text-xs">
            {player.name} fell in <span className="font-bold">Chapter {chapter}</span> of the{' '}
            <span className="font-bold">{THEME_LABELS[theme]}</span>.
          </p>
        </div>
      </div>

      <div className="h-px w-48 mb-8 bg-gradient-to-r from-transparent via-red-900 to-transparent" />

      <button
        onClick={onNewGame}
        className="px-8 py-3 bg-stone-800 hover:bg-stone-700 border border-stone-700 text-stone-200 rounded-xl font-bold tracking-wide transition-all cursor-pointer hover:scale-105"
      >
        Begin a New Chronicle
      </button>
    </div>
  );
}

function StatCell({ label, value }) {
  return (
    <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-3 text-center">
      <p className="text-stone-600 text-xs uppercase tracking-wide mb-1">{label}</p>
      <p className="text-stone-200 font-bold text-lg">{value}</p>
    </div>
  );
}
