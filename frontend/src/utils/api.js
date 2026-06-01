const API_BASE = import.meta.env.VITE_API_URL || '/api';

/**
 * Fetch video info from backend
 */
export async function fetchVideoInfo(url) {
  const res = await fetch(`${API_BASE}/info`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url }),
    signal: AbortSignal.timeout(35000),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || 'Failed to fetch video information');
  }

  return data;
}

/**
 * Get download URL for a video/audio
 */
export function getDownloadUrl(url, type, formatId, quality) {
  const params = new URLSearchParams({
    url,
    type,
    ...(formatId && { formatId }),
    ...(quality && { quality }),
  });
  return `${API_BASE}/download?${params.toString()}`;
}

/**
 * Check API status
 */
export async function checkApiStatus() {
  try {
    const res = await fetch(`${API_BASE}/status`, {
      signal: AbortSignal.timeout(5000),
    });
    return await res.json();
  } catch {
    return { status: 'offline' };
  }
}

/**
 * Format view count
 */
export function formatCount(n) {
  if (!n) return null;
  if (n >= 1e9) return `${(n / 1e9).toFixed(1)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return n.toString();
}

/**
 * Format upload date
 */
export function formatDate(dateStr) {
  if (!dateStr) return null;
  const y = dateStr.slice(0, 4);
  const m = dateStr.slice(4, 6);
  const d = dateStr.slice(6, 8);
  return new Date(`${y}-${m}-${d}`).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
}

/**
 * Local storage history management
 */
const HISTORY_KEY = 'streamdrop_history';
const MAX_HISTORY = 20;

export function getHistory() {
  try {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '[]');
  } catch {
    return [];
  }
}

export function addToHistory(item) {
  try {
    const history = getHistory();
    const exists = history.findIndex(h => h.url === item.url);
    if (exists !== -1) history.splice(exists, 1);
    history.unshift({ ...item, savedAt: Date.now() });
    if (history.length > MAX_HISTORY) history.splice(MAX_HISTORY);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch {}
}

export function clearHistory() {
  localStorage.removeItem(HISTORY_KEY);
}

export function removeFromHistory(url) {
  const history = getHistory().filter(h => h.url !== url);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

/**
 * Platform icons mapping (emoji-based, no external deps)
 */
export const PLATFORM_ICONS = {
  'YouTube': '▶',
  'Twitter/X': '✕',
  'Instagram': '◈',
  'TikTok': '♪',
  'Facebook': 'f',
  'Vimeo': '◉',
  'Twitch': '⬡',
  'Reddit': '◯',
  'Dailymotion': '▷',
  'SoundCloud': '☁',
  'Rumble': '◈',
  'Unknown': '◉',
};

export const PLATFORM_COLORS = {
  'YouTube': '#ff0000',
  'Twitter/X': '#1d9bf0',
  'Instagram': '#e1306c',
  'TikTok': '#ff0050',
  'Facebook': '#1877f2',
  'Vimeo': '#1ab7ea',
  'Twitch': '#9146ff',
  'Reddit': '#ff4500',
  'SoundCloud': '#ff5500',
  'Unknown': '#E50914',
};
