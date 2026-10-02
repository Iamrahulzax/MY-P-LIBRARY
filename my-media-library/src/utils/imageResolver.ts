import { fetchGameCover } from '../services/gameApi';
import { fetchMoviePoster } from '../services/movieApi';

const CACHE_STORAGE_KEY = 'media_poster_cache_v1';

// In-memory cache
const memoryCache: Record<string, string | null> = {};

// Load cache from localStorage
try {
  const saved = localStorage.getItem(CACHE_STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    Object.assign(memoryCache, parsed);
  }
} catch {
  // Ignore
}

function saveToStorage() {
  try {
    localStorage.setItem(CACHE_STORAGE_KEY, JSON.stringify(memoryCache));
  } catch {
    // Ignore storage limit issues
  }
}

/**
 * Checks if a given URL is a verified official media URL (Steam, TMDB, IGDB, etc.)
 * and not an unrelated generic stock photo (such as unsplash).
 */
export function isVerifiedOfficialUrl(url?: string): boolean {
  if (!url) return false;
  const trimmed = url.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (lower.includes('images.unsplash.com')) return false; // Exclude generic unsplash stock photos
  if (lower.includes('example.com')) return false;
  return (
    lower.startsWith('http://') ||
    lower.startsWith('https://') ||
    lower.startsWith('data:image/') ||
    lower.startsWith('blob:') ||
    lower.startsWith('/') ||
    lower.startsWith('./') ||
    lower.includes('steamstatic.com') ||
    lower.includes('image.tmdb.org') ||
    lower.includes('images.igdb.com') ||
    lower.includes('rawg.io') ||
    lower.includes('nintendo.com')
  );
}

/**
 * Invalidate a cached media URL
 */
export function invalidateMediaCache(type: 'game' | 'movie', title: string, year?: number) {
  const cacheKey = `${type}:${title.trim().toLowerCase()}:${year || ''}`;
  delete memoryCache[cacheKey];
  saveToStorage();
}

/**
 * Resolves the accurate real-world poster or cover URL for a game or movie.
 * Cached in memory and localStorage so it is never fetched repeatedly.
 */
export async function resolveMediaImage(
  type: 'game' | 'movie',
  title: string,
  year?: number,
  platform?: string,
  customCover?: string
): Promise<string | null> {
  const cacheKey = `${type}:${title.trim().toLowerCase()}:${year || ''}`;

  // 1. If customCover is provided by the user, prioritize it immediately
  if (customCover && customCover.trim() && isVerifiedOfficialUrl(customCover)) {
    memoryCache[cacheKey] = customCover.trim();
    saveToStorage();
    return customCover.trim();
  }

  // 2. Check memory / localStorage cache
  if (memoryCache[cacheKey] !== undefined) {
    return memoryCache[cacheKey];
  }

  // 3. Resolve using dedicated API service
  let resolvedUrl: string | null = null;

  if (type === 'game') {
    const res = await fetchGameCover(title, platform);
    if (res && res.coverUrl) {
      resolvedUrl = res.coverUrl;
    }
  } else {
    const res = await fetchMoviePoster(title, year);
    if (res && res.posterUrl) {
      resolvedUrl = res.posterUrl;
    }
  }

  // 4. If resolver found a verified poster, cache it
  if (resolvedUrl) {
    memoryCache[cacheKey] = resolvedUrl;
    saveToStorage();
    return resolvedUrl;
  }

  // 5. If not found, cache null so we don't repeat failed requests
  memoryCache[cacheKey] = null;
  saveToStorage();
  return null;
}
