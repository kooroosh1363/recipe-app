import { demoRecipes } from "../data/demo-recipes";
import { cacheFreshness, createCacheRecord, readCache, writeCache } from "../lib/cache";

const CACHE_KEY = "recipe-relay:featured";
const API_BASE = "https://api.spoonacular.com";
const TTL = 5 * 60 * 1000;

function normalizeLiveRecipe(recipe) {
  return {
    id: Number(recipe.id),
    title: String(recipe.title || "Untitled recipe"),
    time: Number(recipe.readyInMinutes || 30),
    image: String(recipe.image || ""),
    tags: [
      ...(recipe.vegetarian ? ["vegetarian"] : []),
      ...(recipe.vegan ? ["vegan"] : []),
      ...(recipe.glutenFree ? ["gluten-free"] : []),
    ],
    summary: "Live Spoonacular result."
  };
}

export async function fetchWithRetry(fetcher, url, options = {}, retries = 1) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await fetcher(url, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (error) {
      if (error?.name === "AbortError") throw error;
      lastError = error;
    }
  }

  throw lastError;
}

export async function loadRecipes({
  storage = globalThis.localStorage,
  fetcher = globalThis.fetch,
  signal,
  now = Date.now(),
} = {}) {
  const cached = readCache(storage, CACHE_KEY);
  const freshness = cacheFreshness(cached, { now, ttl: TTL });
  const key = String(import.meta.env.VITE_SPOONACULAR_API_KEY || "").trim();

  if (freshness === "fresh") {
    return { recipes: cached.value, source: "cache", freshness: "fresh" };
  }

  if (!key) {
    const value = cached?.value?.length ? cached.value : demoRecipes;
    return {
      recipes: value,
      source: cached?.value?.length ? "cache" : "demo",
      freshness: cached ? "stale" : "fallback",
    };
  }

  const url = new URL("/recipes/random", API_BASE);
  url.searchParams.set("apiKey", key);
  url.searchParams.set("number", "6");

  try {
    const response = await fetchWithRetry(fetcher, url, { signal }, 1);
    const payload = await response.json();
    const recipes = Array.isArray(payload.recipes) ? payload.recipes.map(normalizeLiveRecipe) : [];
    const value = recipes.length ? recipes : demoRecipes;
    writeCache(storage, CACHE_KEY, createCacheRecord(value, now));
    return { recipes: value, source: "network", freshness: "fresh" };
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    const value = cached?.value?.length ? cached.value : demoRecipes;
    return {
      recipes: value,
      source: cached?.value?.length ? "cache" : "demo",
      freshness: cached ? "stale" : "fallback",
      error: error instanceof Error ? error.message : "Request failed",
    };
  }
}
