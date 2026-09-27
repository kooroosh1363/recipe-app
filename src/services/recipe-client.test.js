import { describe, expect, it, vi } from "vitest";
import { fetchWithRetry } from "./recipe-client";

describe("network retry policy", () => {
  it("retries one transient failure", async () => {
    const fetcher = vi
      .fn()
      .mockRejectedValueOnce(new Error("temporary"))
      .mockResolvedValueOnce({ ok: true });

    const response = await fetchWithRetry(fetcher, "https://example.test", {}, 1);

    expect(response.ok).toBe(true);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it("does not retry aborted requests", async () => {
    const abort = new DOMException("aborted", "AbortError");
    const fetcher = vi.fn().mockRejectedValue(abort);

    await expect(fetchWithRetry(fetcher, "https://example.test", {}, 2)).rejects.toMatchObject({ name: "AbortError" });
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
