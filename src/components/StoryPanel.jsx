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
              entry.critFail ? 'bg-red-950/50 border-red-800 text-red-300' :
              entry.success ? 'bg-green-950/50 border-green-800 text-green-300' :
              'bg-stone-900 border-stone-700 text-stone-400'
            }`}>
              {entry.critSuccess && '✦ CRITICAL SUCCESS — '}
              {entry.critFail && '✕ CRITICAL FAIL — '}
              {!entry.critSuccess && !entry.critFail && (entry.success ? '✓ Success — ' : '✗ Failure — ')}
              {entry.text}
            </div>
          )}
          {entry.type === 'item' && (
            <p className="text-emerald-400 text-xs font-medium">
              ◆ Found: {entry.text}
            </p>
          )}
          {entry.type === 'damage' && (
            <p className={`text-xs font-medium ${entry.value > 0 ? 'text-green-400' : 'text-red-400'}`}>
              {entry.value > 0 ? `♥ +${entry.value} HP restored` : `💔 ${Math.abs(entry.value)} damage taken`}
            </p>
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
