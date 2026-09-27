import { useEffect, useMemo, useRef, useState } from "react";
import { loadRecipes } from "./services/recipe-client";
import { filterByQuery, readQuery, writeQuery } from "./lib/url-state";

function Diagnostics({ source, freshness, loading, error }) {
  return (
    <aside className="diagnostics" aria-label="Data diagnostics">
      <div><span>source</span><strong>{source}</strong></div>
      <div><span>freshness</span><strong>{freshness}</strong></div>
      <div><span>request</span><strong>{loading ? "in flight" : "idle"}</strong></div>
      <div><span>fallback</span><strong>{error ? "active" : "not needed"}</strong></div>
    </aside>
  );
}

export default function App() {
  const [recipes, setRecipes] = useState([]);
  const [query, setQuery] = useState(() => readQuery(window.location.search));
  const [source, setSource] = useState("boot");
  const [freshness, setFreshness] = useState("miss");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const activeRequest = useRef(null);

  const load = async () => {
    activeRequest.current?.abort();

    const controller = new AbortController();
    activeRequest.current = controller;
    setLoading(true);
    setError("");

    try {
      const result = await loadRecipes({ signal: controller.signal });
      if (controller.signal.aborted) return;

      setRecipes(result.recipes);
      setSource(result.source);
      setFreshness(result.freshness);
      setError(result.error || "");
    } catch (requestError) {
      if (requestError.name !== "AbortError") setError(requestError.message);
    } finally {
      if (activeRequest.current === controller) {
        activeRequest.current = null;
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    load();

    return () => {
      activeRequest.current?.abort();
    };
  }, []);

  useEffect(() => {
    const next = writeQuery(window.location.search, query);
    window.history.replaceState(null, "", `${window.location.pathname}${next}`);
  }, [query]);

  const visible = useMemo(() => filterByQuery(recipes, query), [recipes, query]);

  return (
    <main className="shell">
      <header className="hero">
        <div className="hero__top">
          <a href="#results" className="brand">RecipeRelay</a>
          <span>React data-resilience lab</span>
        </div>

        <div className="hero__grid">
          <div>
            <p className="eyebrow">Network behavior made visible</p>
            <h1>Recipes are easy. Reliable data is the project.</h1>
          </div>
          <p>
            A small React client that treats latency, retries, cache freshness,
            request cancellation, fallback data, and URL state as first-class UI concerns.
          </p>
        </div>
      </header>

      <section className="control-panel" aria-label="Recipe controls">
        <label>
          <span>Search title, summary, or tag</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try vegan, lemon, quick…"
          />
        </label>
        <button type="button" onClick={() => load()} disabled={loading}>
          {loading ? "Refreshing…" : "Refresh data"}
        </button>
      </section>

      <Diagnostics source={source} freshness={freshness} loading={loading} error={error} />

      {error ? (
        <p className="notice" role="status">
          Network request failed; cached or demo data is being shown. Detail: {error}
        </p>
      ) : null}

      <section id="results" className="results" aria-labelledby="results-title">
        <div className="results__heading">
          <div>
            <p className="eyebrow">Result stream</p>
            <h2 id="results-title">{visible.length} {visible.length === 1 ? "recipe" : "recipes"}</h2>
          </div>
          <p>Search is mirrored into the URL so the current view can be bookmarked.</p>
        </div>

        {loading && recipes.length === 0 ? (
          <div className="loading-grid" aria-label="Loading recipes">
            {Array.from({ length: 6 }, (_, index) => <div className="loading-card" key={index} />)}
          </div>
        ) : visible.length ? (
          <div className="recipe-grid">
            {visible.map((recipe) => (
              <article className="recipe-card" key={recipe.id}>
                <img src={recipe.image} alt="" width="640" height="420" loading="lazy" />
                <div>
                  <div className="meta"><span>{recipe.time} min</span><span>{recipe.tags?.[0] || "recipe"}</span></div>
                  <h3>{recipe.title}</h3>
                  <p>{recipe.summary}</p>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No matching recipes</h3>
            <p>Clear or broaden the URL-backed search query.</p>
            <button type="button" onClick={() => setQuery("")}>Clear search</button>
          </div>
        )}
      </section>

      <footer>
        <strong>RecipeRelay</strong>
        <span>Cache TTL · retry · abort · fallback · URL state</span>
      </footer>
    </main>
  );
}
