import { useEffect, useRef } from 'react';

export default function StoryPanel({ entries, isLoading }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries, isLoading]);

  return (
    <div className="bg-stone-950 border border-stone-800 rounded-xl p-5 h-80 overflow-y-auto space-y-4 scroll-smooth">
      {entries.map((entry, i) => (
        <div key={i} className="story-text">
          {entry.type === 'narrative' && (
            <p className="text-stone-300 leading-relaxed text-sm" style={{ fontFamily: 'Georgia, serif' }}>
              {entry.text}
            </p>
          )}
          {entry.type === 'action' && (
            <p className="text-amber-500 text-sm italic border-l-2 border-amber-800 pl-3">
              &gt; {entry.text}
            </p>
          )}
          {entry.type === 'roll' && (
            <div className={`text-xs font-mono px-3 py-2 rounded-lg border ${
              entry.critSuccess ? 'bg-amber-950/50 border-amber-700 text-amber-300' :
              entry.critFail    ? 'bg-red-950/50 border-red-800 text-red-300' :
              entry.success     ? 'bg-green-950/50 border-green-800 text-green-300' :
                                  'bg-stone-900 border-stone-700 text-stone-400'
            }`}>
              {entry.critSuccess && '✦ CRITICAL SUCCESS — '}
              {entry.critFail    && '✕ CRITICAL FAIL — '}
              {!entry.critSuccess && !entry.critFail && (entry.success ? '✓ Success — ' : '✗ Failure — ')}
              {entry.text}
            </div>
          )}
          {entry.type === 'item' && (
            <p className="text-emerald-400 text-xs font-medium">◆ Found: {entry.text}</p>
          )}
          {entry.type === 'damage' && (
            <p className={`text-xs font-medium ${entry.value > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {entry.value > 0 ? `♥ +${entry.value} HP restored` : `💔 ${Math.abs(entry.value)} damage taken`}
            </p>
          )}
          {entry.type === 'xp' && (
            <p className="text-amber-600 text-xs font-medium">✦ +{entry.value} XP</p>
          )}
          {entry.type === 'knockout' && (
            <div className="bg-purple-950/50 border border-purple-700 rounded-lg px-3 py-2 text-xs text-purple-300 font-medium">
              ⭐ Knocked out — but woke up safe with HP restored! The adventure continues!
            </div>
          )}
          {entry.type === 'boss' && (
            <div className="text-center border border-red-900/70 bg-red-950/20 rounded-lg py-2 px-3">
              <span className="text-red-500 text-xs font-bold tracking-widest uppercase">
                ⚔ Boss Encounter ⚔
              </span>
            </div>
          )}
          {entry.type === 'chapter_header' && (
            <div className="text-center py-3 border-y border-stone-800 my-2">
              <p className="text-stone-600 text-xs uppercase tracking-widest mb-1">Chapter {entry.chapter}</p>
              {entry.title && <p className="text-amber-500 text-sm font-bold" style={{ fontFamily: 'Georgia, serif' }}>{entry.title}</p>}
            </div>
          )}
        </div>
      ))}

      {isLoading && (
        <div className="flex items-center gap-3 text-stone-500 text-sm story-text">
          <div className="flex gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-1.5 h-1.5 bg-stone-600 rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
          <span>The tale unfolds...</span>
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
