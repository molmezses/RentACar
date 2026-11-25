
import { afterEach, describe, expect, it, vi } from "vitest";

import {
  fetchVehicles,
  VehicleApiError,
} from "./api";

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("fetchVehicles", () => {
  it("sends filters and returns paginated vehicles", async () => {
    const apiResponse = {
      items: [],
      pagination: {
        page: 2,
        limit: 20,
        total: 35,
        totalPages: 2,
      },
    };

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(apiResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchVehicles({
      page: 2,
      limit: 20,
      search: " Toyota ",
      category: "SEDAN",
      fleetStatus: "ACTIVE",
      transmission: "AUTOMATIC",
      sortBy: "dailyPrice",
      sortOrder: "asc",
    });

    const [url, init] = fetchMock.mock.calls[0];

    const parsedUrl = new URL(url, "http://localhost");

    expect(parsedUrl.pathname).toBe("/api/tenant/vehicles");
    expect(parsedUrl.searchParams.get("page")).toBe("2");
    expect(parsedUrl.searchParams.get("search")).toBe("Toyota");
    expect(parsedUrl.searchParams.get("category")).toBe("SEDAN");
    expect(parsedUrl.searchParams.get("fleetStatus")).toBe("ACTIVE");
    expect(parsedUrl.searchParams.get("transmission")).toBe("AUTOMATIC");
    expect(parsedUrl.searchParams.get("sortBy")).toBe("dailyPrice");
    expect(parsedUrl.searchParams.get("sortOrder")).toBe("asc");

    expect(init.method).toBe("GET");
    expect(init.credentials).toBe("same-origin");
    expect(result).toEqual(apiResponse);
  });

  it.each([401, 403])(
    "preserves the HTTP %i error status",
    async (status) => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          new Response(
            JSON.stringify({ message: "Erişim reddedildi." }),
            {
              status,
              headers: { "Content-Type": "application/json" },
            },
          ),
        ),
      );

      await expect(fetchVehicles()).rejects.toMatchObject({
        name: "VehicleApiError",
        status,
        message: "Erişim reddedildi.",
      });
    },
  );

  it("handles network failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Failed to fetch")),
    );

    await expect(fetchVehicles()).rejects.toMatchObject({
      name: "VehicleApiError",
      status: 0,
    });
  });

  it("rejects malformed successful responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ items: [] }), {
          status: 200,
        }),
      ),
    );

    await expect(fetchVehicles()).rejects.toBeInstanceOf(
      VehicleApiError,
    );
  });
});
