import { describe, expect, it } from "vitest";
import { filterByQuery, readQuery, writeQuery } from "./url-state";

const recipes = [
  { title: "Lemon Pasta", summary: "quick dinner", tags: ["vegetarian"] },
  { title: "Bean Bowl", summary: "hearty lunch", tags: ["vegan"] },
];

describe("URL search policy", () => {
  it("reads and writes q without destroying other params", () => {
    expect(readQuery("?q=lemon&view=grid")).toBe("lemon");
    expect(writeQuery("?view=grid", "miso")).toBe("?view=grid&q=miso");
    expect(writeQuery("?q=old&view=grid", "")).toBe("?view=grid");
  });

  it("filters across title, summary, and tags", () => {
    expect(filterByQuery(recipes, "lemon")).toHaveLength(1);
    expect(filterByQuery(recipes, "vegan")[0].title).toBe("Bean Bowl");
  });
});
