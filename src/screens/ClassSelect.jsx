import { useState } from 'react';

const CLASSES = {
  fantasy: [
    { id: 'warrior', name: 'Warrior', icon: '⚔️', hp: 35, stats: { str: 5, agi: 2, int: 1, fth: 2 }, desc: 'Unbreakable. Hits harder than fate itself.' },
    { id: 'mage', name: 'Mage', icon: '🔮', hp: 25, stats: { str: 1, agi: 2, int: 5, fth: 2 }, desc: 'Power beyond mortal grasp. Fragile as glass.' },
    { id: 'rogue', name: 'Rogue', icon: '🗡️', hp: 28, stats: { str: 2, agi: 5, int: 2, fth: 1 }, desc: 'Shadow and steel. Strikes before seen.' },
    { id: 'paladin', name: 'Paladin', icon: '🛡️', hp: 32, stats: { str: 2, agi: 1, int: 2, fth: 5 }, desc: 'Divine wrath made flesh. Unyielding.' },
  ],
  scifi: [
    { id: 'soldier', name: 'Soldier', icon: '🔫', hp: 35, stats: { str: 5, agi: 2, int: 1, fth: 2 }, desc: 'Combat-hardened. Kills without hesitation.' },
    { id: 'hacker', name: 'Hacker', icon: '💻', hp: 25, stats: { str: 1, agi: 2, int: 5, fth: 2 }, desc: 'Systems bend to their will. Soft body, sharp mind.' },
    { id: 'pilot', name: 'Pilot', icon: '🛸', hp: 28, stats: { str: 2, agi: 5, int: 2, fth: 1 }, desc: 'Reflexes beyond human. Born in zero-g.' },
    { id: 'psychic', name: 'Psychic', icon: '🧠', hp: 30, stats: { str: 1, agi: 2, int: 2, fth: 5 }, desc: 'Mind over matter. Reality answers to them.' },
  ],
  biblical: [
    { id: 'judge', name: 'Judge', icon: '⚔️', hp: 35, stats: { str: 5, agi: 2, int: 1, fth: 2 }, desc: 'Chosen to deliver. Wrath of the righteous.' },
    { id: 'prophet', name: 'Prophet', icon: '🕊️', hp: 27, stats: { str: 1, agi: 2, int: 2, fth: 5 }, desc: 'Hears what others cannot. Marked by the divine.' },
    { id: 'scribe', name: 'Scribe', icon: '📜', hp: 25, stats: { str: 1, agi: 2, int: 5, fth: 2 }, desc: 'Knowledge as weapon. Ancient wisdom incarnate.' },
    { id: 'shepherd', name: 'Shepherd', icon: '🌿', hp: 30, stats: { str: 2, agi: 5, int: 1, fth: 2 }, desc: 'Guardian of the flock. Patient, swift, lethal.' },
  ],
  polynesian: [
    { id: 'toa', name: 'Toa / Warrior', icon: '🪃', hp: 35, stats: { str: 5, agi: 2, int: 1, fth: 2 }, desc: 'Tattooed with victories. Death is an old friend.' },
    { id: 'navigator', name: 'Navigator', icon: '⭐', hp: 26, stats: { str: 1, agi: 2, int: 5, fth: 2 }, desc: 'Reads stars, winds, and lies. Never lost.' },
    { id: 'waverider', name: 'Wave Rider', icon: '🌊', hp: 29, stats: { str: 2, agi: 5, int: 2, fth: 1 }, desc: 'One with the ocean. Faster than storm surge.' },
    { id: 'tohunga', name: 'Tohunga', icon: '🌺', hp: 28, stats: { str: 1, agi: 2, int: 2, fth: 5 }, desc: 'Speaks to ancestors. The spirit world obeys.' },
  ],
};

const THEME_LABELS = {
  fantasy: { label: 'Classic Fantasy', accent: 'text-emerald-400', border: 'border-emerald-700', selected: 'border-emerald-400 bg-emerald-950/50' },
  scifi: { label: 'Sci-Fi / Space', accent: 'text-cyan-400', border: 'border-cyan-700', selected: 'border-cyan-400 bg-cyan-950/50' },
  biblical: { label: 'Biblical Epic', accent: 'text-amber-400', border: 'border-amber-700', selected: 'border-amber-400 bg-amber-950/50' },
  polynesian: { label: 'Polynesian Myth', accent: 'text-blue-400', border: 'border-blue-700', selected: 'border-blue-400 bg-blue-950/50' },
};

function StatBar({ label, value }) {
  const pct = (value / 5) * 100;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-stone-500 w-7 uppercase font-bold">{label}</span>
      <div className="flex-1 h-1.5 bg-stone-800 rounded-full overflow-hidden">
        <div className="h-full bg-amber-500 rounded-full" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-stone-400 w-4 text-right">{value}</span>
    </div>
  );
}

export default function ClassSelect({ theme, onSelect }) {
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState('');
  const themeInfo = THEME_LABELS[theme];
  const classes = CLASSES[theme];

  const handleStart = () => {
    if (!selected || !name.trim()) return;
    onSelect({ classData: selected, name: name.trim() });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="text-center mb-8 fade-in">
        <p className={`text-sm uppercase tracking-widest ${themeInfo.accent} mb-1`}>{themeInfo.label}</p>
        <h2 className="text-4xl font-bold text-stone-100" style={{ fontFamily: 'Georgia, serif' }}>
          Choose Your Class
        </h2>
        <p className="text-stone-500 text-sm mt-2">Your class determines how you face death.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-5xl mb-8 fade-in">
        {classes.map((cls) => {
          const isSelected = selected?.id === cls.id;
          return (
            <button
              key={cls.id}
              onClick={() => setSelected(cls)}
              className={`
                border rounded-xl p-5 text-left transition-all duration-200 cursor-pointer
                ${isSelected ? themeInfo.selected : 'border-stone-800 bg-stone-900/50 hover:border-stone-600'}
                hover:scale-[1.02]
              `}
            >
              <div className="text-3xl mb-3">{cls.icon}</div>
              <h3 className={`font-bold text-base mb-1 ${isSelected ? themeInfo.accent : 'text-stone-200'}`}>
                {cls.name}
              </h3>
              <p className="text-stone-500 text-xs mb-3 leading-relaxed">{cls.desc}</p>

              <div className="space-y-1.5 mb-3">
                <StatBar label="STR" value={cls.stats.str} />
                <StatBar label="AGI" value={cls.stats.agi} />
                <StatBar label="INT" value={cls.stats.int} />
                <StatBar label="FTH" value={cls.stats.fth} />
              </div>

              <div className="flex items-center justify-between text-xs mt-2">
                <span className="text-stone-600">HP</span>
                <span className="text-red-400 font-bold">{cls.hp}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="w-full max-w-sm fade-in">
        <label className="block text-stone-400 text-sm mb-2 text-center tracking-wide">Hero Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleStart()}
          placeholder="Enter your name..."
          className="w-full bg-stone-900 border border-stone-700 rounded-lg px-4 py-3 text-stone-100 text-center placeholder-stone-600 focus:outline-none focus:border-amber-600 transition-colors"
          maxLength={24}
        />
        <button
          onClick={handleStart}
          disabled={!selected || !name.trim()}
          className={`
            mt-4 w-full py-3 rounded-lg font-bold tracking-widest uppercase text-sm transition-all duration-200
            ${selected && name.trim()
              ? 'bg-amber-700 hover:bg-amber-600 text-amber-100 cursor-pointer hover:scale-[1.02] shadow-lg shadow-amber-900/30'
              : 'bg-stone-800 text-stone-600 cursor-not-allowed'}
          `}
        >
          Begin Chronicle
        </button>
      </div>
    </div>
  );
}
