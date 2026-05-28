const THEMES = [
  {
    id: 'fantasy',
    name: 'Classic Fantasy',
    subtitle: 'Swords, Sorcery & Shadow',
    description: 'Ancient ruins, dark magic, fallen kingdoms. Heroes are tested. Few survive.',
    icon: '⚔️',
    bg: 'from-stone-900 to-emerald-950',
    border: 'border-emerald-800',
    hover: 'hover:border-emerald-500',
    accent: 'text-emerald-400',
    glow: 'hover:shadow-emerald-900/50',
  },
  {
    id: 'scifi',
    name: 'Sci-Fi / Space',
    subtitle: 'Stars, Guns & Cold Void',
    description: 'Alien horrors, rogue AIs, megacorp tyranny. Space is merciless. Survive or die.',
    icon: '🚀',
    bg: 'from-stone-900 to-cyan-950',
    border: 'border-cyan-800',
    hover: 'hover:border-cyan-500',
    accent: 'text-cyan-400',
    glow: 'hover:shadow-cyan-900/50',
  },
  {
    id: 'biblical',
    name: 'Biblical Epic',
    subtitle: 'Faith, Trial & Divine Wrath',
    description: 'Harsh deserts, divine trials, fallen cities. Faith is tested. The divine is real but silent.',
    icon: '✡️',
    bg: 'from-stone-900 to-amber-950',
    border: 'border-amber-800',
    hover: 'hover:border-amber-500',
    accent: 'text-amber-400',
    glow: 'hover:shadow-amber-900/50',
  },
  {
    id: 'polynesian',
    name: 'Polynesian Myth',
    subtitle: 'Ocean, Spirits & Ancestral Fire',
    description: 'Vast oceans, volcanic islands, demigods, and ancient rivalries. The sea decides who lives.',
    icon: '🌊',
    bg: 'from-stone-900 to-blue-950',
    border: 'border-blue-800',
    hover: 'hover:border-blue-500',
    accent: 'text-blue-400',
    glow: 'hover:shadow-blue-900/50',
  },
];

export default function ThemeSelect({ onSelect }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="text-center mb-12 fade-in">
        <h1 className="text-6xl font-bold tracking-widest mb-3 gold-shimmer" style={{ fontFamily: 'Georgia, serif' }}>
          CHRONICLE
        </h1>
        <p className="text-stone-400 text-lg tracking-wide">Choose your world. Your fate follows.</p>
        <div className="mt-4 h-px w-48 mx-auto bg-gradient-to-r from-transparent via-amber-700 to-transparent" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 w-full max-w-3xl fade-in">
        {THEMES.map((theme) => (
          <button
            key={theme.id}
            onClick={() => onSelect(theme.id)}
            className={`
              relative bg-gradient-to-br ${theme.bg}
              border ${theme.border} ${theme.hover}
              rounded-xl p-6 text-left
              transition-all duration-300
              hover:shadow-xl ${theme.glow} hover:scale-[1.02]
              cursor-pointer group
            `}
          >
            <div className="flex items-start gap-4">
              <span className="text-4xl">{theme.icon}</span>
              <div>
                <h2 className={`text-xl font-bold ${theme.accent} mb-1`}>{theme.name}</h2>
                <p className="text-stone-400 text-sm font-medium mb-2">{theme.subtitle}</p>
                <p className="text-stone-500 text-sm leading-relaxed">{theme.description}</p>
              </div>
            </div>
            <div className={`absolute bottom-3 right-4 text-xs ${theme.accent} opacity-0 group-hover:opacity-100 transition-opacity`}>
              Enter world →
            </div>
          </button>
        ))}
      </div>

      <p className="mt-10 text-stone-600 text-sm italic fade-in">
        "Not all who venture forth return."
      </p>
    </div>
  );
}
