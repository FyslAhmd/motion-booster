/**
 * Lightweight in-memory cache with TTL and request deduplication.
 * Prevents redundant Meta API calls within the same server process.
 *
 * - Cache hit → returns instantly (<1ms)
 * - In-flight dedup → concurrent requests for the same key share one fetch
 * - Cache miss → runs the fetcher, stores result, returns
 */

interface CacheEntry {
  data: unknown;
  expires: number;
}

const store = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<unknown>>();

/** Default TTL: 2 minutes */
const DEFAULT_TTL = 2 * 60 * 1000;

/**
 * Fetch data with caching + request deduplication.
 */
export async function cachedFetch<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs: number = DEFAULT_TTL,
): Promise<T> {
  // 1. Cache hit
  const entry = store.get(key);
  if (entry && Date.now() < entry.expires) {
    return entry.data as T;
  }

  // 2. Request deduplication — share in-flight promise
  const pending = inflight.get(key);
  if (pending) return pending as Promise<T>;

  // 3. Fetch → cache → return
  const promise = fetcher()
    .then((data) => {
      store.set(key, { data, expires: Date.now() + ttlMs });
      inflight.delete(key);
      if (store.size > 50) pruneExpired();
      return data;
    })
    .catch((err) => {
      inflight.delete(key);
      throw err;
    });

  inflight.set(key, promise);
  return promise;
}

/** Remove all expired entries */
function pruneExpired() {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (now >= entry.expires) store.delete(key);
  }
}

/** Clear cache — optionally only keys starting with a given prefix */
export function invalidateCache(prefix?: string) {
  if (!prefix) {
    store.clear();
    return;
  }
  for (const key of store.keys()) {
    if (key.startsWith(prefix)) store.delete(key);
  }
}
