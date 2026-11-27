import { afterEach, describe, expect, it, vi } from "vitest";

import { fetchVehicles, fetchVehicleById, VehicleApiError } from "./api";

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

  it.each([401, 403])("preserves the HTTP %i error status", async (status) => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ message: "Erişim reddedildi." }), {
          status,
          headers: { "Content-Type": "application/json" },
        }),
      ),
    );

    await expect(fetchVehicles()).rejects.toMatchObject({
      name: "VehicleApiError",
      status,
      message: "Erişim reddedildi.",
    });
  });

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

    await expect(fetchVehicles()).rejects.toBeInstanceOf(VehicleApiError);
  });
});

describe("fetchVehicleById", () => {
  const vehicle = {
    id: "vehicle-123",
    plate: "34 ABC 123",
    make: "Toyota",
    model: "Corolla",
    modelYear: 2024,
    category: "SEDAN",
    transmission: "AUTOMATIC",
    fuelType: "HYBRID",
    seatCount: 5,
    odometerKm: 45000,
    dailyPrice: "1500.00",
    currency: "TRY",
    fleetStatus: "ACTIVE",
  };

  it("requests vehicle detail and returns the response", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify(vehicle), { status: 200 }),
      );

    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchVehicleById("vehicle-123");

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/tenant/vehicles/vehicle-123",
      expect.objectContaining({
        method: "GET",
        cache: "no-store",
        credentials: "same-origin",
      }),
    );

    expect(result).toEqual(vehicle);
  });

  it("encodes the vehicle ID in the request URL", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify(vehicle), { status: 200 }),
      );

    vi.stubGlobal("fetch", fetchMock);

    await fetchVehicleById("vehicle/123");

    expect(fetchMock.mock.calls[0][0]).toBe(
      "/api/tenant/vehicles/vehicle%2F123",
    );
  });

  it("rejects an empty vehicle ID", async () => {
    await expect(fetchVehicleById("  ")).rejects.toMatchObject({
      name: "VehicleApiError",
      status: 400,
    });
  });

  it.each([401, 403, 404])("preserves HTTP %i errors", async (status) => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValue(
          new Response(JSON.stringify({ message: "Araç görüntülenemedi." }), {
            status,
          }),
        ),
    );

    await expect(fetchVehicleById("vehicle-123")).rejects.toMatchObject({
      name: "VehicleApiError",
      status,
      message: "Araç görüntülenemedi.",
    });
  });

  it("handles network failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new TypeError("Network error")),
    );

    await expect(fetchVehicleById("vehicle-123")).rejects.toMatchObject({
      name: "VehicleApiError",
      status: 0,
    });
  });

  it("rejects malformed successful responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: "vehicle-123" }), {
          status: 200,
        }),
      ),
    );

    await expect(fetchVehicleById("vehicle-123")).rejects.toMatchObject({
      name: "VehicleApiError",
      status: 502,
    });
  });
});
