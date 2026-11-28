import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ALLOWED_QUERY_PARAMS = [
  "page",
  "limit",
  "search",
  "category",
  "fleetStatus",
  "transmission",
  "fuelType",
  "sortBy",
  "sortOrder",
] as const;

function errorResponse(
  message: string | string[],
  status: number,
) {
  return NextResponse.json(
    { message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

export async function GET(request: Request) {
  // HttpOnly cookie yalnızca sunucu tarafında okunur.
  const cookieStore = await cookies();
  const accessToken = cookieStore.get(
    "rentacar_tenant_access",
  )?.value;

  if (!accessToken) {
    return errorResponse(
      "Oturum bulunamadı. Lütfen tekrar giriş yapın.",
      401,
    );
  }

  const apiUrl =
    process.env.API_INTERNAL_URL ??
    "http://localhost:3001";

  const requestUrl = new URL(request.url);
  const backendUrl = new URL("/tenant/vehicles", apiUrl);

  // Yalnızca F3'ün desteklediği sorgu parametrelerini ilet.
  for (const key of ALLOWED_QUERY_PARAMS) {
    const values = requestUrl.searchParams.getAll(key);

    if (values.length > 1) {
      return errorResponse(
        "Tekrarlanan sorgu parametresi.",
        400,
      );
    }

    if (values.length === 1) {
      backendUrl.searchParams.set(key, values[0]);
    }
  }

  let response: Response;

  try {
    response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return errorResponse(
      "Araç servisine ulaşılamadı. Lütfen tekrar deneyin.",
      502,
    );
  }

  if (response.status === 401) {
    return errorResponse(
      "Oturum süresi dolmuş. Lütfen tekrar giriş yapın.",
      401,
    );
  }

  if (response.status === 403) {
    return errorResponse(
      "Araçları görüntüleme yetkiniz bulunmuyor.",
      403,
    );
  }

  if (response.status === 400) {
    return errorResponse(
      "Araç listeleme parametreleri geçersiz.",
      400,
    );
  }

  if (!response.ok) {
    return errorResponse(
      "Araçlar yüklenirken bir hata oluştu.",
      502,
    );
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    return errorResponse(
      "Araç servisinden geçersiz yanıt alındı.",
      502,
    );
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
    return errorResponse(
      "Araç listesi beklenen biçimde değil.",
      502,
    );
  }

  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}

// Yeni araç oluşturma isteğini backend'e iletir.
export async function POST(request: Request) {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get(
    "rentacar_tenant_access",
  )?.value;

  if (!accessToken) {
    return errorResponse(
      "Oturum bulunamadı. Lütfen tekrar giriş yapın.",
      401,
    );
  }

  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse(
      "Gönderilen araç bilgileri geçersiz JSON formatında.",
      400,
    );
  }

  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body)
  ) {
    return errorResponse(
      "Gönderilen araç bilgileri geçersiz.",
      400,
    );
  }

  const apiUrl =
    process.env.API_INTERNAL_URL ??
    "http://localhost:3001";

  const backendUrl = new URL("/tenant/vehicles", apiUrl);

  let response: Response;

  try {
    response = await fetch(backendUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return errorResponse(
      "Araç servisine ulaşılamadı. Lütfen tekrar deneyin.",
      502,
    );
  }

  if (response.status === 401) {
    return errorResponse(
      "Oturum süresi dolmuş. Lütfen tekrar giriş yapın.",
      401,
    );
  }

  if (response.status === 403) {
    return errorResponse(
      "Araç oluşturma yetkiniz bulunmuyor.",
      403,
    );
  }

  if (response.status === 400 || response.status === 409) {
  let message: string | string[] =
    response.status === 409
      ? "Araç bilgileri mevcut bir araçla çakışıyor."
      : "Gönderilen araç bilgileri geçersiz.";

  try {
    const data = await response.json();

    if (typeof data?.message === "string") {
      message = data.message;
    } else if (
      Array.isArray(data?.message) &&
      data.message.every(
        (item: unknown) => typeof item === "string",
      )
    ) {
      message = data.message;
    }
  } catch {
    // Varsayılan hata mesajı kullanılır.
  }

  return errorResponse(message, response.status);
}

  if (!response.ok) {
    return errorResponse(
      "Araç oluşturulurken bir hata oluştu.",
      502,
    );
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    return errorResponse(
      "Araç servisinden geçersiz yanıt alındı.",
      502,
    );
  }

  if (
    typeof data !== "object" ||
    data === null ||
    !("id" in data) ||
    typeof data.id !== "string"
  ) {
    return errorResponse(
      "Oluşturulan araç bilgileri beklenen biçimde değil.",
      502,
    );
  }

  return NextResponse.json(data, {
    status: response.status,
    headers: { "Cache-Control": "no-store" },
  });
}