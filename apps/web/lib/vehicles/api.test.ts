import { afterEach, describe, expect, it, vi } from "vitest";

import {
  fetchVehicles,
  fetchVehicle,
  fetchVehicleById,
  createVehicle,
  updateVehicle,
  VehicleApiError,
} from "./api";

import type { CreateVehicleInput } from "@/types/vehicle";
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

describe("fetchVehicle", () => {
  it("doğru endpoint üzerinden araç bilgilerini getirir", async () => {
    const controller = new AbortController();

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(vehicleResponse), {
        status: 200,
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const result = await fetchVehicle(
      "vehicle-1",
      controller.signal,
    );

    expect(fetchMock).toHaveBeenCalledOnce();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/tenant/vehicles/vehicle-1",
      expect.objectContaining({
        method: "GET",
        credentials: "same-origin",
        cache: "no-store",
        signal: controller.signal,
      }),
    );

    expect(result).toEqual(vehicleResponse);
  });
});

describe("createVehicle", () => {
  it("araç bilgilerini POST isteği ile gönderir", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(vehicleResponse), {
        status: 201,
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const result = await createVehicle(vehicleInput);

    expect(fetchMock).toHaveBeenCalledOnce();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/tenant/vehicles",
      expect.objectContaining({
        method: "POST",
        credentials: "same-origin",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(vehicleInput),
      }),
    );

    expect(result).toEqual(vehicleResponse);
  });
});

const vehicleInput: CreateVehicleInput = {
  plate: "38ABC123",
  make: "Toyota",
  model: "Corolla",
  modelYear: 2023,
  category: "SEDAN",
  transmission: "AUTOMATIC",
  fuelType: "PETROL",
  seatCount: 5,
  odometerKm: 25000,
  dailyPrice: "1500.00",
  currency: "TRY",
};

const vehicleResponse = {
  id: "vehicle-1",
  ...vehicleInput,
};


describe("updateVehicle", () => {
  it("değiştirilen araç bilgilerini PATCH isteği ile gönderir", async () => {
    const updateInput = {
      color: "Siyah",
      dailyPrice: "2000.00",
    };

    const updatedVehicle = {
      ...vehicleResponse,
      ...updateInput,
    };

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify(updatedVehicle), {
        status: 200,
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const result = await updateVehicle(
      "vehicle-1",
      updateInput,
    );

    expect(fetchMock).toHaveBeenCalledOnce();

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/tenant/vehicles/vehicle-1",
      expect.objectContaining({
        method: "PATCH",
        credentials: "same-origin",
        cache: "no-store",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateInput),
      }),
    );

    expect(result).toEqual(updatedVehicle);
  });

  it("null değerleri korur ve undefined alanları göndermez", async () => {
  const fetchMock = vi.fn().mockResolvedValue(
    new Response(JSON.stringify(vehicleResponse), {
      status: 200,
    }),
  );

  vi.stubGlobal("fetch", fetchMock);

  await updateVehicle("vehicle-1", {
    color: null,
    vin: undefined,
    hasAirConditioning: false,
    includedMileageKm: 0,
  });

  expect(fetchMock).toHaveBeenCalledWith(
    "/api/tenant/vehicles/vehicle-1",
    expect.objectContaining({
      body: JSON.stringify({
        color: null,
        hasAirConditioning: false,
        includedMileageKm: 0,
      }),
    }),
  );
});
});


describe("Vehicle API error handling", () => {
  it.each([400, 401, 403, 404, 409])(
    "HTTP %i hata kodunu korur",
    async (status) => {
      vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue(
          new Response(
            JSON.stringify({ message: "API hatası" }),
            { status },
          ),
        ),
      );

      await expect(
        updateVehicle("vehicle-1", { color: "Siyah" }),
      ).rejects.toMatchObject({
        name: "VehicleApiError",
        status,
        message: "API hatası",
        messages: ["API hatası"],
      });
    },
  );


  it("backend validasyon hata dizisini korur", async () => {
  const messages = [
    "plate must be a string",
    "seatCount must be an integer number",
  ];

  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ message: messages }),
        { status: 400 },
      ),
    ),
  );

  await expect(
    createVehicle(vehicleInput),
  ).rejects.toMatchObject({
    name: "VehicleApiError",
    status: 400,
    message: messages.join(" "),
    messages,
  });
});

it("bağlantı hatalarını yönetir", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockRejectedValue(
      new TypeError("Failed to fetch"),
    ),
  );

  await expect(
    createVehicle(vehicleInput),
  ).rejects.toMatchObject({
    name: "VehicleApiError",
    status: 0,
    message:
      "Araç servisine bağlanılamadı. Lütfen tekrar deneyin.",
  });
});

it("JSON olmayan hata yanıtında varsayılan mesajı kullanır", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response("Internal Server Error", {
        status: 502,
      }),
    ),
  );

  await expect(
    createVehicle(vehicleInput),
  ).rejects.toMatchObject({
    name: "VehicleApiError",
    status: 502,
    message: "Araç oluşturulurken bir hata oluştu.",
  });
});

it("araç ID bilgisi olmayan başarılı yanıtı reddeder", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({ make: "Toyota" }),
        { status: 200 },
      ),
    ),
  );

  await expect(
    fetchVehicle("vehicle-1"),
  ).rejects.toMatchObject({
    name: "VehicleApiError",
    status: 502,
    message: "Araç detayı beklenen biçimde değil.",
  });
});

it("başarılı fakat geçersiz JSON yanıtını reddeder", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response("Invalid JSON", {
        status: 200,
      }),
    ),
  );

  await expect(
    fetchVehicle("vehicle-1"),
  ).rejects.toMatchObject({
    name: "VehicleApiError",
    status: 502,
    message: "Araç servisinden geçersiz yanıt alındı.",
  });
});
it("iptal edilen isteği bağlantı hatasına dönüştürmez", async () => {
  const controller = new AbortController();

  const abortError = new DOMException(
    "Request aborted",
    "AbortError",
  );

  vi.stubGlobal(
    "fetch",
    vi.fn().mockRejectedValue(abortError),
  );

  controller.abort();

  await expect(
    fetchVehicle("vehicle-1", controller.signal),
  ).rejects.toBe(abortError);
});
});
