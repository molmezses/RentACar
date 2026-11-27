import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type VehicleRouteContext = {
  params: Promise<{ id: string }>;
};

function errorResponse(message: string | string[],status: number,) {
  return NextResponse.json(
    { message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

// Düzenleme formu için mevcut araç bilgilerini getirir.
export async function GET(
  _request: Request,
  { params }: VehicleRouteContext,
) {
  const { id } = await params;

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

  const backendUrl = new URL(
    `/tenant/vehicles/${encodeURIComponent(id)}`,
    apiUrl,
  );

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
      "Araç bilgilerini görüntüleme yetkiniz bulunmuyor.",
      403,
    );
  }

  if (response.status === 404) {
    return errorResponse("Araç bulunamadı.", 404);
  }

  if (!response.ok) {
    return errorResponse(
      "Araç bilgileri yüklenirken bir hata oluştu.",
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
      "Araç bilgileri beklenen biçimde değil.",
      502,
    );
  }

  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}

// Mevcut aracın düzenlenebilir bilgilerini günceller.
export async function PATCH(
  request: Request,
  { params }: VehicleRouteContext,
) {
  const { id } = await params;

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
    Array.isArray(body) ||
    Object.keys(body).length === 0
  ) {
    return errorResponse(
      "Güncellenecek araç bilgileri geçersiz veya boş.",
      400,
    );
  }

    const apiUrl =
    process.env.API_INTERNAL_URL ??
    "http://localhost:3001";

  const backendUrl = new URL(
    `/tenant/vehicles/${encodeURIComponent(id)}`,
    apiUrl,
  );

  let response: Response;

  try {
    response = await fetch(backendUrl, {
      method: "PATCH",
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
      "Araç güncelleme yetkiniz bulunmuyor.",
      403,
    );
  }

  if (response.status === 404) {
    return errorResponse("Araç bulunamadı.", 404);
  }

  if (response.status === 400 || response.status === 409) {
    let message: string | string[] =
      response.status === 409
        ? "Araç bilgileri mevcut verilerle çakışıyor."
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
      "Araç güncellenirken bir hata oluştu.",
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
      "Güncellenen araç bilgileri beklenen biçimde değil.",
      502,
    );
  }

  return NextResponse.json(data, {
    status: response.status,
    headers: { "Cache-Control": "no-store" },
  });
}