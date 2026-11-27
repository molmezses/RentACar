import type {
  VehicleCategory,
  FleetStatus,
  Transmission,
  FuelType,
  Vehicle,
  VehicleDisplayData,
} from "@/types/vehicle";

//Backenda gönderilebilecek filtreleri Typescripte tanımladık
export type VehicleListQuery = {
  page?: number;
  limit?: number;
  search?: string;
  category?: VehicleCategory;
  fleetStatus?: FleetStatus;
  transmission?: Transmission;
  fuelType?: FuelType;
  sortBy?: "createdAt" | "make" | "model" | "plate" | "dailyPrice";
  sortOrder?: "asc" | "desc";
};

export type VehiclePagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type VehicleListResponse = {
  items: VehicleDisplayData[];
  pagination: VehiclePagination;
};

export class VehicleApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "VehicleApiError";
  }
}

//Next.js Api routeundan gerçek araç listesini alır
export async function fetchVehicles(
  query: VehicleListQuery = {},
  signal?: AbortSignal,
): Promise<VehicleListResponse> {
  const params = new URLSearchParams(); //Arama,filtreleme,sayfalama değerlerini url e dönüştürür

  if (query.page !== undefined) {
    params.set("page", String(query.page));
  }

  if (query.limit !== undefined) {
    params.set("limit", String(query.limit));
  }

  if (query.search?.trim()) {
    params.set("search", query.search.trim());
  }

  if (query.category) {
    params.set("category", query.category);
  }

  if (query.fleetStatus) {
    params.set("fleetStatus", query.fleetStatus);
  }

  if (query.transmission) {
    params.set("transmission", query.transmission);
  }

  if (query.fuelType) {
    params.set("fuelType", query.fuelType);
  }

  if (query.sortBy) {
    params.set("sortBy", query.sortBy);
  }

  if (query.sortOrder) {
    params.set("sortOrder", query.sortOrder);
  }

  const queryString = params.toString();
  const url = queryString
    ? `/api/tenant/vehicles?${queryString}`
    : "/api/tenant/vehicles";

  let response: Response;

  try {
    response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
      signal,
    });
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }
    //Hataları ayırt etmemizi sağlar
    throw new VehicleApiError(
      "Araç servisine bağlanılamadı. Lütfen tekrar deneyin.",
      0,
    );
  }

  if (!response.ok) {
    let message = "Araçlar yüklenirken bir hata oluştu.";

    try {
      const data: unknown = await response.json();

      if (
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
      ) {
        message = data.message;
      }
    } catch {
      // Hata yanıtı JSON değilse varsayılan mesajı kullan.
    }

    throw new VehicleApiError(message, response.status);
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new VehicleApiError("Araç servisinden geçersiz yanıt alındı.", 502);
  }

  if (
    typeof data !== "object" ||
    data === null ||
    !("items" in data) ||
    !Array.isArray(data.items) ||
    !("pagination" in data) ||
    typeof data.pagination !== "object" ||
    data.pagination === null
  ) {
    throw new VehicleApiError("Araç listesi beklenen biçimde değil.", 502);
  }

  // Bu aşamada temel yanıt yapısı kontrol ediliyor.
  return data as VehicleListResponse;
}

/**
 * Tenant Admin oturumuyla tek bir aracın detayını getirir.
 * JWT tarayıcıya açılmaz; istek Next.js API Route üzerinden gider.
 */
export async function fetchVehicleById(
  id: string,
  signal?: AbortSignal,
): Promise<Vehicle> {
  if (!id.trim()) {
    throw new VehicleApiError("Araç kimliği belirtilmedi.", 400);
  }

  const url = `/api/tenant/vehicles/${encodeURIComponent(id)}`;

  let response: Response;

  try {
    response = await fetch(url, {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
      signal,
    });
  } catch (error) {
    if (signal?.aborted) {
      throw error;
    }

    throw new VehicleApiError(
      "Araç servisine bağlanılamadı. Lütfen tekrar deneyin.",
      0,
    );
  }

  if (!response.ok) {
    const defaultMessage =
      response.status === 404
        ? "Araç bulunamadı."
        : response.status === 401
          ? "Oturum süresi dolmuş. Lütfen tekrar giriş yapın."
          : "Araç detayları yüklenirken bir hata oluştu.";

    let message = defaultMessage;

    try {
      const data: unknown = await response.json();

      if (
        typeof data === "object" &&
        data !== null &&
        "message" in data &&
        typeof data.message === "string"
      ) {
        message = data.message;
      }
    } catch {
      // JSON olmayan hatalarda varsayılan mesajı koru.
    }

    throw new VehicleApiError(message, response.status);
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new VehicleApiError("Araç servisinden geçersiz yanıt alındı.", 502);
  }

  if (
    typeof data !== "object" ||
    data === null ||
    !("id" in data) ||
    typeof data.id !== "string" ||
    !("plate" in data) ||
    typeof data.plate !== "string" ||
    !("make" in data) ||
    typeof data.make !== "string" ||
    !("model" in data) ||
    typeof data.model !== "string"
  ) {
    throw new VehicleApiError("Araç detayı beklenen biçimde değil.", 502);
  }

  return data as Vehicle;
}
