import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const cookieGet = vi.fn();

vi.mock("next/headers", () => ({
  cookies: vi.fn(async () => ({
    get: cookieGet,
  })),
}));

import { GET } from "./route";

const context = {
  params: Promise.resolve({ id: "vehicle-123" }),
};

const request = new Request(
  "http://localhost:3000/api/tenant/vehicles/vehicle-123",
);

beforeEach(() => {
  cookieGet.mockReset();
  cookieGet.mockReturnValue({ value: "test-access-token" });
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("GET /api/tenant/vehicles/[id]", () => {
  it("rejects missing authentication", async () => {
    cookieGet.mockReturnValue(undefined);

    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(request, context);

    expect(response.status).toBe(401);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("forwards vehicle detail securely to the backend", async () => {
    const vehicle = {
      id: "vehicle-123",
      plate: "34 ABC 123",
      make: "Toyota",
      model: "Corolla",
    };

    const fetchMock = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify(vehicle), { status: 200 }),
      );

    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(request, context);

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual(vehicle);

    const [url, options] = fetchMock.mock.calls[0];

    expect(String(url)).toContain("/tenant/vehicles/vehicle-123");
    expect(options.headers.Authorization).toBe("Bearer test-access-token");
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });

  it.each([401, 403, 404])(
    "preserves HTTP %i without leaking backend details",
    async (status) => {
      vi.stubGlobal(
        "fetch",
        vi
          .fn()
          .mockResolvedValue(
            new Response(
              JSON.stringify({ message: "Sensitive backend details" }),
              { status },
            ),
          ),
      );

      const response = await GET(request, context);
      const body = await response.json();

      expect(response.status).toBe(status);
      expect(JSON.stringify(body)).not.toContain("Sensitive backend details");
    },
  );

  it("rejects invalid IDs before calling the backend", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const response = await GET(request, {
      params: Promise.resolve({ id: " " }),
    });

    expect(response.status).toBe(400);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("handles backend network failures", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network failure")),
    );

    const response = await GET(request, context);

    expect(response.status).toBe(502);
  });

  it("rejects malformed successful backend responses", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ id: "vehicle-123" }), {
          status: 200,
        }),
      ),
    );

    const response = await GET(request, context);

    expect(response.status).toBe(502);
  });
});
