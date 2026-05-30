import { useEffect, useRef } from 'react';
import { getTheme, panelStyle } from '../utils/theme';

export default function StoryPanel({ entries, isLoading, theme, kidMode = false }) {
  const bottomRef = useRef(null);
  const tc = getTheme(theme);
  const ps = panelStyle(tc, { kidMode });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries, isLoading]);

  return (
    <div
      className="rounded-xl overflow-y-auto"
      style={{ ...ps, minHeight: '200px', maxHeight: '52vh' }}
    >
      <div className="p-4 space-y-3">
        {entries.map((entry, i) => (
          <div key={i} className="story-text">
            {entry.type === 'narrative' && (
              <p
                className="text-stone-300 leading-relaxed text-sm"
                style={{
                  fontFamily: 'Georgia, serif',
                  textShadow: `0 0 12px ${tc.color}10`,
                }}
              >
                {entry.text}
              </p>
            )}
            {entry.type === 'action' && (
              <p className="text-sm italic pl-3" style={{ color: `${tc.color}cc`, borderLeft: `2px solid ${tc.color}40` }}>
                &gt; {entry.text}
              </p>
            )}
            {entry.type === 'roll' && (
              <div
                className="text-xs font-mono px-3 py-2 rounded-lg"
                style={entry.critSuccess
                  ? { background: `${tc.color}18`, border: `1px solid ${tc.color}50`, color: tc.color }
                  : entry.critFail
                  ? { background: 'rgba(200,20,20,0.15)', border: '1px solid rgba(200,20,20,0.4)', color: '#f87171' }
                  : entry.success
                  ? { background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.3)', color: '#4ade80' }
                  : { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: '#78716c' }
                }
              >
                {entry.critSuccess && '✦ CRITICAL SUCCESS — '}
                {entry.critFail    && '✕ CRITICAL FAIL — '}
                {!entry.critSuccess && !entry.critFail && (entry.success ? '✓ Success — ' : '✗ Failure — ')}
                {entry.text}
              </div>
            )}
            {entry.type === 'item' && (
              <p className="text-xs font-medium" style={{ color: '#4ade80' }}>◆ Found: {entry.text}</p>
            )}
            {entry.type === 'damage' && (
              <p className="text-xs font-medium" style={{ color: entry.value > 0 ? '#4ade80' : '#f87171' }}>
                {entry.value > 0 ? `♥ +${entry.value} HP restored` : `💔 ${Math.abs(entry.value)} damage taken`}
              </p>
            )}
            {entry.type === 'xp' && (
              <p className="text-xs font-medium" style={{ color: `${tc.color}aa` }}>✦ +{entry.value} XP</p>
            )}
            {entry.type === 'knockout' && (
              <div className="text-xs font-medium px-3 py-2 rounded-lg"
                   style={{ background: 'rgba(147,51,234,0.15)', border: '1px solid rgba(147,51,234,0.4)', color: '#c084fc' }}>
                ⭐ Knocked out — woke up safe with HP restored! The adventure continues!
              </div>
            )}
            {entry.type === 'boss' && (
              <div className="text-center py-2 px-3 rounded-lg"
                   style={{ background: 'rgba(200,20,20,0.12)', border: '1px solid rgba(200,20,20,0.35)' }}>
                <span className="text-xs font-bold tracking-widest uppercase text-red-500">⚔ Boss Encounter ⚔</span>
              </div>
            )}
            {entry.type === 'crit_effect' && (
              <div className="text-xs font-medium px-3 py-2 rounded-lg"
                   style={entry.positive
                     ? { background: `${tc.color}12`, border: `1px solid ${tc.color}40`, color: tc.color }
                     : { background: 'rgba(200,20,20,0.12)', border: '1px solid rgba(200,20,20,0.35)', color: '#f87171' }
                   }>
                {entry.positive ? '✦ Permanent gain: ' : '✕ Permanent consequence: '}
                {entry.text}
              </div>
            )}
            {entry.type === 'chapter_header' && (
              <div className="text-center py-3 my-1" style={{ borderTop: `1px solid ${tc.color}20`, borderBottom: `1px solid ${tc.color}20` }}>
                <p className="text-xs uppercase tracking-widest mb-1" style={{ color: `${tc.color}60` }}>Chapter {entry.chapter}</p>
                {entry.title && (
                  <p className="text-sm font-bold" style={{ color: tc.color, fontFamily: 'Georgia, serif' }}>{entry.title}</p>
                )}
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-3 text-sm story-text" style={{ color: `${tc.color}50` }}>
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full animate-bounce"
                  style={{ background: `${tc.color}50`, animationDelay: `${i * 0.15}s` }}
                />
              ))}
            </div>
            <span>The tale unfolds...</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
