// ── Theme configuration ──────────────────────────────────────────────────
// All visual-only constants. No game logic here.

export const THEME_CONFIG = {
  fantasy: {
    label: 'Classic Fantasy',
    icon: '⚔️',
    color: '#C9A84C',
    colorDim: '#C9A84C88',
    rgb: '201,168,76',
    bgUrl: 'https://images.unsplash.com/photo-1518982054853-a5d2d14b6d7b?auto=format&w=1920&q=80',
    overlayColor: 'rgba(0,0,0,0.72)',
    accent: '#C9A84C',
    kidColor: '#E8C97A',
  },
  scifi: {
    label: 'Sci-Fi / Space',
    icon: '🚀',
    color: '#4FC3F7',
    colorDim: '#4FC3F788',
    rgb: '79,195,247',
    bgUrl: 'https://images.unsplash.com/photo-1462331940025-496dfbfc7564?auto=format&w=1920&q=80',
    overlayColor: 'rgba(0,5,20,0.75)',
    accent: '#4FC3F7',
    kidColor: '#80D8FF',
  },
  biblical: {
    label: 'Biblical Epic',
    icon: '✡️',
    color: '#E8D5A3',
    colorDim: '#E8D5A388',
    rgb: '232,213,163',
    bgUrl: 'https://images.unsplash.com/photo-1539768942893-daf53e448371?auto=format&w=1920&q=80',
    overlayColor: 'rgba(10,5,0,0.74)',
    accent: '#E8D5A3',
    kidColor: '#F5E6C0',
  },
  polynesian: {
    label: 'Polynesian Myth',
    icon: '🌊',
    color: '#26C6B0',
    colorDim: '#26C6B088',
    rgb: '38,198,176',
    bgUrl: 'https://images.unsplash.com/photo-1505118380757-91f5f5632de0?auto=format&w=1920&q=80',
    overlayColor: 'rgba(0,10,15,0.74)',
    accent: '#26C6B0',
    kidColor: '#4DD9C4',
  },
};

export function getTheme(themeId) {
  return THEME_CONFIG[themeId] || THEME_CONFIG.fantasy;
}

// Returns inline style object for a glowing panel
export function panelStyle(tc, opts = {}) {
  const { kidMode = false, intense = false } = opts;
  const c = kidMode ? tc.kidColor : tc.color;
  const bg = kidMode ? 'rgba(5,5,20,0.62)' : 'rgba(0,0,0,0.78)';
  const glowStrength = intense ? '30px' : '18px';
  const glowFaint = intense ? '60px' : '40px';
  return {
    background: bg,
    backdropFilter: 'blur(18px)',
    WebkitBackdropFilter: 'blur(18px)',
    border: `1px solid ${c}45`,
    boxShadow: `0 0 ${glowStrength} ${c}20, 0 0 ${glowFaint} ${c}08, inset 0 1px 0 ${c}18`,
  };
}

// Returns inline text-shadow for glowing text
export function glowText(color, strength = 1) {
  const s = strength * 8;
  return { textShadow: `0 0 ${s}px ${color}80, 0 0 ${s * 2}px ${color}30` };
}
