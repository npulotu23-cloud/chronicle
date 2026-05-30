import { useState } from 'react';
import { THEME_CONFIG } from '../utils/theme';

const THEMES = [
  {
    id: 'fantasy',
    name: 'Classic Fantasy',
    subtitle: 'Swords, Sorcery & Shadow',
    description: 'Ancient ruins, dark magic, fallen kingdoms. Heroes are tested. Few survive.',
    kidDescription: 'Brave knights, magical wizards, and exciting quests await!',
  },
  {
    id: 'scifi',
    name: 'Sci-Fi / Space',
    subtitle: 'Stars, Guns & Cold Void',
    description: 'Alien horrors, rogue AIs, megacorp tyranny. Space is merciless.',
    kidDescription: 'Spaceships, friendly aliens, and amazing gadgets. Blast off!',
  },
  {
    id: 'biblical',
    name: 'Biblical Epic',
    subtitle: 'Faith, Trial & Divine Wrath',
    description: 'Harsh deserts, divine trials, fallen cities. Faith is tested.',
    kidDescription: 'Brave heroes, amazing miracles, and exciting quests. Be bold!',
  },
  {
    id: 'polynesian',
    name: 'Polynesian Myth',
    subtitle: 'Ocean, Spirits & Ancestral Fire',
    description: 'Vast oceans, volcanic islands, demigods. The sea decides who lives.',
    kidDescription: 'Magical oceans, friendly spirits, and amazing islands!',
  },
];

export default function ThemeSelect({ onSelect }) {
  const [kidMode, setKidMode] = useState(false);

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-3 py-8">
      {/* Atmospheric bg */}
      <div className="fixed inset-0 z-0" style={{ background: 'radial-gradient(ellipse at 50% 30%, rgba(100,80,30,0.15) 0%, rgba(0,0,0,1) 70%)' }} />

      <div className="relative z-10 w-full max-w-lg">
        {/* Title */}
        <div className="text-center mb-5 fade-in">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-widest gold-shimmer" style={{ fontFamily: 'Georgia, serif' }}>
            CHRONICLE
          </h1>
          <p className="text-stone-500 text-sm mt-2 tracking-wide">
            {kidMode ? 'Pick your world and start the adventure!' : 'Choose your world. Your fate follows.'}
          </p>
        </div>

        {/* Kid Mode toggle */}
        <div className="flex justify-center mb-5 fade-in">
          <button
            onClick={() => setKidMode(k => !k)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-full border font-bold text-sm
              transition-all duration-300 cursor-pointer
              ${kidMode
                ? 'bg-purple-950/60 border-purple-500 text-purple-200 shadow-lg shadow-purple-900/30'
                : 'bg-black/40 border-stone-700 text-stone-500 hover:border-stone-500 hover:text-stone-300'}
            `}
          >
            <span>{kidMode ? '⭐' : '🛡️'}</span>
            <span>Kid Mode</span>
            <span className={`ml-1 w-7 h-3.5 rounded-full relative transition-colors duration-300 ${kidMode ? 'bg-purple-500' : 'bg-stone-700'}`}>
              <span className={`absolute top-0.5 w-2.5 h-2.5 bg-white rounded-full shadow transition-all duration-300 ${kidMode ? 'left-[14px]' : 'left-0.5'}`} />
            </span>
          </button>
        </div>

        {/* 2×2 theme grid */}
        <div className="grid grid-cols-2 gap-2.5 mb-5 fade-in">
          {THEMES.map((t) => {
            const tc = THEME_CONFIG[t.id];
            return (
              <button
                key={t.id}
                onClick={() => onSelect({ themeId: t.id, kidMode })}
                className="relative overflow-hidden rounded-xl text-left cursor-pointer group transition-all duration-300 hover:scale-[1.03] active:scale-[0.98]"
                style={{ border: `1px solid ${tc.color}30` }}
              >
                {/* Card background image */}
                <div
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(${tc.bgUrl})`, backgroundColor: '#080808' }}
                />
                {/* Dark overlay */}
                <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,0.72)' }} />
                {/* Hover glow */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"
                     style={{ boxShadow: `inset 0 0 30px ${tc.color}20` }} />

                {/* Content */}
                <div className="relative z-10 p-3.5">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xl">{tc.icon}</span>
                    <h2 className="font-bold text-sm leading-tight" style={{ color: tc.color }}>
                      {t.name}
                    </h2>
                  </div>
                  <p className="text-stone-400 text-xs leading-relaxed line-clamp-2">
                    {kidMode ? t.kidDescription : t.description}
                  </p>
                  <div className="mt-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: tc.color }}>
                    {kidMode ? "Let's go →" : 'Enter →'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        <p className="text-center text-stone-700 text-xs italic fade-in">
          {kidMode ? '"Every great hero starts with one brave step."' : '"Not all who venture forth return."'}
        </p>
      </div>
    </div>
  );
}
