const THEME_DIVIDERS = {
  fantasy: '⚔️ ✦ ⚔️',
  scifi: '◈ ─── ◈',
  biblical: '✦ ✡ ✦',
  polynesian: '≈ 🌊 ≈',
};

const CHAPTER_SUBTITLES = ['', 'The First Trial', 'The Darkening', 'The Final Hour'];

export default function ChapterTransition({ chapter, title, description, theme, onContinue }) {
  const divider = THEME_DIVIDERS[theme] || '✦';
  const subtitle = CHAPTER_SUBTITLES[chapter] || '';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 fade-in">
      {/* Atmospheric top line */}
      <div className="h-px w-64 mb-12 bg-gradient-to-r from-transparent via-stone-600 to-transparent" />

      <div className="text-center max-w-lg">
        <p className="text-stone-600 text-xs uppercase tracking-[0.3em] mb-4">
          Chapter {chapter} of 3
        </p>

        <h2
          className="text-5xl font-bold mb-2 gold-shimmer"
          style={{ fontFamily: 'Georgia, serif' }}
        >
          {title || subtitle}
        </h2>

        <p className="text-stone-500 text-lg mb-6">{divider}</p>

        {description && (
          <p
            className="text-stone-400 text-base leading-relaxed mb-10 italic"
            style={{ fontFamily: 'Georgia, serif' }}
          >
            "{description}"
          </p>
        )}

        {!description && (
          <p className="text-stone-500 text-sm mb-10">
            A new chapter begins. The path ahead grows darker.
          </p>
        )}

        <button
          onClick={onContinue}
          className="px-8 py-3.5 bg-amber-800 hover:bg-amber-700 text-amber-100 rounded-xl font-bold tracking-widest uppercase text-sm transition-all hover:scale-[1.03] cursor-pointer shadow-lg shadow-amber-900/30"
        >
          Begin Chapter {chapter} →
        </button>
      </div>

      <div className="h-px w-64 mt-12 bg-gradient-to-r from-transparent via-stone-600 to-transparent" />
    </div>
  );
}
