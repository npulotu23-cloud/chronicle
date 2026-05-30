import { getTheme, glowText } from '../utils/theme';

const DIVIDERS = {
  fantasy: '⚔ ✦ ⚔',
  scifi:   '◈ ─ ◈',
  biblical:'✦ ✡ ✦',
  polynesian: '≋ 🌊 ≋',
};

export default function ChapterTransition({ chapter, title, description, theme, onContinue }) {
  const tc = getTheme(theme);
  const divider = DIVIDERS[theme] || '✦';

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12">
      {/* Background */}
      <div className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
           style={{ backgroundImage: `url(${tc.bgUrl})`, backgroundColor: '#050508' }} />
      <div className="fixed inset-0 z-[1]" style={{ background: `${tc.overlayColor}` }} />
      {/* Extra dark center vignette */}
      <div className="fixed inset-0 z-[2] pointer-events-none"
           style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.6) 100%)' }} />

      <div className="relative z-10 text-center max-w-md">
        {/* Top line */}
        <div className="h-px w-32 mx-auto mb-10 rise-1"
             style={{ background: `linear-gradient(90deg, transparent, ${tc.color}60, transparent)` }} />

        <p className="text-xs uppercase tracking-[0.4em] mb-4 rise-1"
           style={{ color: `${tc.color}80` }}>
          Chapter {chapter} of 3
        </p>

        <h2
          className="text-4xl sm:text-5xl font-bold mb-3 rise-2"
          style={{ fontFamily: 'Georgia, serif', color: tc.color, ...glowText(tc.color, 1.2) }}
        >
          {title || `Chapter ${chapter}`}
        </h2>

        <p className="mb-6 text-base rise-2" style={{ color: `${tc.color}70` }}>{divider}</p>

        {description && (
          <p className="text-stone-400 text-sm leading-relaxed mb-10 italic rise-3"
             style={{ fontFamily: 'Georgia, serif' }}>
            "{description}"
          </p>
        )}

        {!description && (
          <p className="text-stone-600 text-sm mb-10 rise-3">The path ahead grows darker.</p>
        )}

        <button
          onClick={onContinue}
          className="px-8 py-3 rounded-xl font-bold tracking-widest uppercase text-sm transition-all hover:scale-[1.04] cursor-pointer active:scale-[0.98] rise-4"
          style={{
            background: `linear-gradient(135deg, ${tc.color}28, ${tc.color}14)`,
            border: `1px solid ${tc.color}55`,
            color: tc.color,
            boxShadow: `0 0 24px ${tc.color}18`,
          }}
        >
          Begin Chapter {chapter} →
        </button>

        <div className="h-px w-32 mx-auto mt-10 rise-4"
             style={{ background: `linear-gradient(90deg, transparent, ${tc.color}60, transparent)` }} />
      </div>
    </div>
  );
}
