import { useState } from 'react';
import { getTheme, panelStyle, glowText } from '../utils/theme';

const CLASSES = {
  fantasy: [
    { id: 'warrior', name: 'Warrior',  icon: '⚔️', hp: 35, stats: { str: 5, agi: 2, int: 1, fth: 2 }, desc: 'Unbreakable. Hits harder than fate itself.' },
    { id: 'mage',    name: 'Mage',     icon: '🔮', hp: 25, stats: { str: 1, agi: 2, int: 5, fth: 2 }, desc: 'Power beyond mortal grasp. Fragile as glass.' },
    { id: 'rogue',   name: 'Rogue',    icon: '🗡️', hp: 28, stats: { str: 2, agi: 5, int: 2, fth: 1 }, desc: 'Shadow and steel. Strikes before seen.' },
    { id: 'paladin', name: 'Paladin',  icon: '🛡️', hp: 32, stats: { str: 2, agi: 1, int: 2, fth: 5 }, desc: 'Divine wrath made flesh. Unyielding.' },
  ],
  scifi: [
    { id: 'soldier', name: 'Soldier',  icon: '🔫', hp: 35, stats: { str: 5, agi: 2, int: 1, fth: 2 }, desc: 'Combat-hardened. Kills without hesitation.' },
    { id: 'hacker',  name: 'Hacker',   icon: '💻', hp: 25, stats: { str: 1, agi: 2, int: 5, fth: 2 }, desc: 'Systems bend to their will. Soft body, sharp mind.' },
    { id: 'pilot',   name: 'Pilot',    icon: '🛸', hp: 28, stats: { str: 2, agi: 5, int: 2, fth: 1 }, desc: 'Reflexes beyond human. Born in zero-g.' },
    { id: 'psychic', name: 'Psychic',  icon: '🧠', hp: 30, stats: { str: 1, agi: 2, int: 2, fth: 5 }, desc: 'Mind over matter. Reality answers to them.' },
  ],
  biblical: [
    { id: 'judge',   name: 'Judge',    icon: '⚔️', hp: 35, stats: { str: 5, agi: 2, int: 1, fth: 2 }, desc: 'Chosen to deliver. Wrath of the righteous.' },
    { id: 'prophet', name: 'Prophet',  icon: '🕊️', hp: 27, stats: { str: 1, agi: 2, int: 2, fth: 5 }, desc: 'Hears what others cannot. Marked by the divine.' },
    { id: 'scribe',  name: 'Scribe',   icon: '📜', hp: 25, stats: { str: 1, agi: 2, int: 5, fth: 2 }, desc: 'Knowledge as weapon. Ancient wisdom incarnate.' },
    { id: 'shepherd',name: 'Shepherd', icon: '🌿', hp: 30, stats: { str: 2, agi: 5, int: 1, fth: 2 }, desc: 'Guardian of the flock. Patient, swift, lethal.' },
  ],
  polynesian: [
    { id: 'toa',       name: 'Toa / Warrior', icon: '🪃', hp: 35, stats: { str: 5, agi: 2, int: 1, fth: 2 }, desc: 'Tattooed with victories. Death is an old friend.' },
    { id: 'navigator', name: 'Navigator',     icon: '⭐', hp: 26, stats: { str: 1, agi: 2, int: 5, fth: 2 }, desc: 'Reads stars, winds, and lies. Never lost.' },
    { id: 'waverider', name: 'Wave Rider',    icon: '🌊', hp: 29, stats: { str: 2, agi: 5, int: 2, fth: 1 }, desc: 'One with the ocean. Faster than storm surge.' },
    { id: 'tohunga',   name: 'Tohunga',       icon: '🌺', hp: 28, stats: { str: 1, agi: 2, int: 2, fth: 5 }, desc: 'Speaks to ancestors. The spirit world obeys.' },
  ],
};

function StatBar({ label, value, color }) {
  const pct = (value / 5) * 100;
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="text-stone-600 w-7 uppercase font-bold">{label}</span>
      <div className="flex-1 h-1 bg-black/40 rounded-full overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-stone-400 w-3 text-right">{value}</span>
    </div>
  );
}

export default function ClassSelect({ theme, onSelect }) {
  const [selected, setSelected] = useState(null);
  const [name, setName] = useState('');
  const tc = getTheme(theme);
  const classes = CLASSES[theme];

  const handleStart = () => {
    if (!selected || !name.trim()) return;
    onSelect({ classData: selected, name: name.trim() });
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-3 py-8">
      {/* Background */}
      <div className="fixed inset-0 z-0 bg-cover bg-center"
           style={{ backgroundImage: `url(${tc.bgUrl})`, backgroundColor: '#050508' }} />
      <div className="fixed inset-0 z-[1]" style={{ background: tc.overlayColor }} />

      <div className="relative z-10 w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-5 fade-in">
          <p className="text-xs uppercase tracking-[0.3em] mb-1" style={{ color: `${tc.color}80` }}>
            {tc.label}
          </p>
          <h2 className="text-3xl font-bold text-stone-100" style={{ fontFamily: 'Georgia, serif' }}>
            Choose Your Class
          </h2>
        </div>

        {/* 2×2 class grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-5 fade-in">
          {classes.map((cls) => {
            const isSel = selected?.id === cls.id;
            return (
              <button
                key={cls.id}
                onClick={() => setSelected(cls)}
                className="text-left rounded-xl p-3.5 transition-all duration-200 cursor-pointer hover:scale-[1.02] active:scale-[0.99]"
                style={{
                  background: isSel ? `${tc.color}15` : 'rgba(0,0,0,0.6)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: isSel ? `1px solid ${tc.color}70` : '1px solid rgba(255,255,255,0.08)',
                  boxShadow: isSel ? `0 0 20px ${tc.color}20` : 'none',
                }}
              >
                <div className="text-2xl mb-2">{cls.icon}</div>
                <h3 className="font-bold text-sm mb-1" style={{ color: isSel ? tc.color : '#d6d3d1' }}>
                  {cls.name}
                </h3>
                <p className="text-stone-600 text-xs mb-2.5 leading-relaxed">{cls.desc}</p>
                <div className="space-y-1 mb-2">
                  <StatBar label="STR" value={cls.stats.str} color={tc.color} />
                  <StatBar label="AGI" value={cls.stats.agi} color={tc.color} />
                  <StatBar label="INT" value={cls.stats.int} color={tc.color} />
                  <StatBar label="FTH" value={cls.stats.fth} color={tc.color} />
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-stone-700">HP</span>
                  <span className="text-red-400 font-bold">{cls.hp}</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Name input + start */}
        <div className="max-w-xs mx-auto fade-in">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleStart()}
            placeholder="Enter your hero name..."
            maxLength={24}
            className="w-full rounded-xl px-4 py-3 text-stone-100 text-center text-sm placeholder-stone-700 focus:outline-none transition-all"
            style={{
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(12px)',
              border: name.trim() ? `1px solid ${tc.color}50` : '1px solid rgba(255,255,255,0.1)',
            }}
          />
          <button
            onClick={handleStart}
            disabled={!selected || !name.trim()}
            className="mt-3 w-full py-3 rounded-xl font-bold tracking-wide text-sm transition-all"
            style={selected && name.trim() ? {
              background: `linear-gradient(135deg, ${tc.color}30, ${tc.color}18)`,
              border: `1px solid ${tc.color}60`,
              color: tc.color,
              cursor: 'pointer',
              boxShadow: `0 0 20px ${tc.color}18`,
            } : {
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              color: 'rgba(255,255,255,0.2)',
              cursor: 'not-allowed',
            }}
          >
            Begin Chronicle
          </button>
        </div>
      </div>
    </div>
  );
}
