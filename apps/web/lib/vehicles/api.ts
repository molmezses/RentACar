import type {
  VehicleCategory,
  FleetStatus,
  Transmission,
  FuelType,
  VehicleDisplayData,
  Vehicle,
  CreateVehicleInput,
  UpdateVehicleInput,
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
    public readonly messages: readonly string[] = [message],
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
): Promise<Omit<Vehicle, "tenantId">> {
  if (!id.trim()) {
    throw new VehicleApiError("Araç kimliği belirtilmedi.", 400);
  }

  return requestVehicle(
    `/api/tenant/vehicles/${encodeURIComponent(id)}`,
    {
      method: "GET",
      signal,
    },
    "Araç detayları yüklenirken bir hata oluştu.",
  );
}

//Omit yalnızca yeni fonksiyonun API dönüş tipini ifade ediyor; mevcut Vehicle tanımını veya tenant sistemini değiştirmiyor.
//Get-Post-Patch işlemlerini ortak bir fonksiyonda topladık
async function requestVehicle(
  url: string,
  options: RequestInit,
  fallbackMessage: string,
): Promise<Omit<Vehicle, "tenantId">> {
  let response: Response;

  try {
    response = await fetch(url, {
      ...options,
      cache: "no-store",
      credentials: "same-origin",
    });
  } catch (error) {
    if (options.signal?.aborted) {
      throw error;
    }

    throw new VehicleApiError(
      "Araç servisine bağlanılamadı. Lütfen tekrar deneyin.",
      0,
    );
  }

  if (!response.ok) {
    const defaultMessage =
      options.method === "GET" && response.status === 404
        ? "Araç bulunamadı."
        : options.method === "GET" && response.status === 401
          ? "Oturum süresi dolmuş. Lütfen tekrar giriş yapın."
          : fallbackMessage;

    let message = defaultMessage;
    let messages: string[] = [defaultMessage];

    try {
      const data = await response.json();

      if (typeof data?.message === "string") {
        message = data.message;
        messages = [data.message];
      } else if (
        Array.isArray(data?.message) &&
        data.message.length > 0 &&
        data.message.every(
          (item: unknown) => typeof item === "string",
        )
      ) {
        messages = data.message;
        message = messages.join(" ");
      }
    } catch {
      // JSON olmayan hata yanıtında varsayılan mesaj kullanılır.
    }

    throw new VehicleApiError(
      message,
      response.status,
      messages,
    );
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new VehicleApiError(
      "Araç servisinden geçersiz yanıt alındı.",
      502,
    );
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
    throw new VehicleApiError(
      options.method === "GET"
        ? "Araç detayı beklenen biçimde değil."
        : "Araç bilgileri beklenen biçimde değil.",
      502,
    );
  }

  return data as Omit<Vehicle, "tenantId">;
}

// Düzenleme formu için mevcut araç bilgilerini getirir.
export async function fetchVehicle(
  id: string,
  signal?: AbortSignal,
): Promise<Omit<Vehicle, "tenantId">> {
  return fetchVehicleById(id, signal);
}

// Yeni araç oluşturur.
export async function createVehicle(
  input: CreateVehicleInput,
): Promise<Omit<Vehicle, "tenantId">> {
  return requestVehicle(
    "/api/tenant/vehicles",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
    "Araç oluşturulurken bir hata oluştu.",
  );
}

// Mevcut aracın düzenlenebilir bilgilerini günceller.
export async function updateVehicle(
  id: string,
  input: UpdateVehicleInput,
): Promise<Omit<Vehicle, "tenantId">> {
  return requestVehicle(
    `/api/tenant/vehicles/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    },
    "Araç güncellenirken bir hata oluştu.",
  );
}