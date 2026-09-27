const DEFAULT_TTL = 5 * 60 * 1000;

export function createCacheRecord(value, now = Date.now()) {
  return { value, storedAt: now };
}

export function cacheFreshness(record, { now = Date.now(), ttl = DEFAULT_TTL } = {}) {
  if (!record || typeof record.storedAt !== "number") return "miss";
  return now - record.storedAt <= ttl ? "fresh" : "stale";
}

export function readCache(storage, key) {
  try {
    const raw = storage?.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function writeCache(storage, key, record) {
  try {
    storage?.setItem(key, JSON.stringify(record));
    return true;
  } catch {
    return false;
  }
}
