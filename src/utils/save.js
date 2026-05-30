const SAVE_KEY = 'chronicle_save_v2';

export function saveGame(data) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch {
    // Silently fail (quota exceeded etc.)
  }
}

export function loadGame() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    // Validate minimum shape
    if (!data?.player?.name || !data?.theme) return null;
    return data;
  } catch {
    return null;
  }
}

export function clearGame() {
  try {
    localStorage.removeItem(SAVE_KEY);
  } catch {}
}

export function hasSave() {
  return loadGame() !== null;
}
