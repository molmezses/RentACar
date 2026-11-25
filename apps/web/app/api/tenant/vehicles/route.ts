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

function errorResponse(message: string, status: number) {
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
