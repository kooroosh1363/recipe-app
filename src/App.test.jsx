import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import App from "./App";

vi.mock("./services/recipe-client", () => ({
  loadRecipes: vi.fn(async () => ({
    source: "demo",
    freshness: "fallback",
    recipes: [
      { id: 1, title: "Lemon Pasta", time: 20, image: "/lemon.jpg", tags: ["quick"], summary: "Bright lemon dinner" },
      { id: 2, title: "Bean Bowl", time: 15, image: "/bean.jpg", tags: ["vegan"], summary: "Hearty lunch" },
    ],
  })),
}));

describe("RecipeRelay", () => {
  beforeEach(() => {
    window.history.replaceState(null, "", "/");
  });
  it("loads recipes and mirrors search into the URL", async () => {
    render(<App />);

    await waitFor(() => expect(screen.getByText("2 recipes")).toBeInTheDocument());

    const search = screen.getByRole("searchbox", { name: /search title/i });
    await userEvent.type(search, "lemon");

    expect(screen.getByText("1 recipe")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Lemon Pasta" })).toBeInTheDocument();
    expect(window.location.search).toBe("?q=lemon");
  });

  it("can manually refresh the data pipeline", async () => {
    render(<App />);
    await waitFor(() => expect(screen.getByText("2 recipes")).toBeInTheDocument());

    await userEvent.click(screen.getByRole("button", { name: "Refresh data" }));
    await waitFor(() => expect(screen.getByRole("button", { name: "Refresh data" })).toBeEnabled());
  });
});
