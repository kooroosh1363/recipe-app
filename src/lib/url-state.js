export function readQuery(search = "") {
  const params = new URLSearchParams(search);
  return String(params.get("q") || "").trim();
}

export function writeQuery(search, query) {
  const params = new URLSearchParams(search || "");
  const value = String(query || "").trim();

  if (value) params.set("q", value);
  else params.delete("q");

  const next = params.toString();
  return next ? `?${next}` : "";
}

export function filterByQuery(recipes, query) {
  const term = String(query || "").trim().toLowerCase();
  if (!term) return Array.isArray(recipes) ? recipes : [];

  return (Array.isArray(recipes) ? recipes : []).filter((recipe) =>
    [recipe.title, recipe.summary, ...(recipe.tags || [])]
      .filter(Boolean)
      .join(" ")
      .toLowerCase()
      .includes(term)
  );
}
