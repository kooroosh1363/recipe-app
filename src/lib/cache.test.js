import { describe, expect, it } from "vitest";
import { cacheFreshness, createCacheRecord, readCache, writeCache } from "./cache";

function storage() {
  const map = new Map();
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => map.set(key, value),
  };
}

describe("cache policy", () => {
  it("classifies missing, fresh, and stale records", () => {
    expect(cacheFreshness(null, { now: 1000, ttl: 100 })).toBe("miss");
    expect(cacheFreshness(createCacheRecord(["x"], 950), { now: 1000, ttl: 100 })).toBe("fresh");
    expect(cacheFreshness(createCacheRecord(["x"], 800), { now: 1000, ttl: 100 })).toBe("stale");
  });

  it("persists JSON records safely", () => {
    const store = storage();
    const record = createCacheRecord([{ id: 1 }], 42);
    expect(writeCache(store, "key", record)).toBe(true);
    expect(readCache(store, "key")).toEqual(record);
  });
});
