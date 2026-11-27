import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

export async function GET(_request: Request, { params }: RouteContext) {
  const { id } = await params;

  if (!id.trim() || id.length > 128) {
    return errorResponse("Geçersiz araç kimliği.", 400);
  }

  // JWT'yi yalnızca Next.js sunucusu okuyabilir.
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("rentacar_tenant_access")?.value;

  if (!accessToken) {
    return errorResponse("Oturum bulunamadı. Lütfen tekrar giriş yapın.", 401);
  }

  const apiUrl = process.env.API_INTERNAL_URL ?? "http://localhost:3001";

  // Araç ID'sini URL içerisinde güvenli biçimde kodla.
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
    return errorResponse("Bu aracı görüntüleme yetkiniz bulunmuyor.", 403);
  }

  if (response.status === 404) {
    return errorResponse("Araç bulunamadı.", 404);
  }

  if (!response.ok) {
    return errorResponse("Araç detayları yüklenirken bir hata oluştu.", 502);
  }

  let data: unknown;

  try {
    data = await response.json();
  } catch {
    return errorResponse("Araç servisinden geçersiz yanıt alındı.", 502);
  }

  // Beklenen temel araç detay alanlarını doğrula.
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
    return errorResponse("Araç detayı beklenen biçimde değil.", 502);
  }

  return NextResponse.json(data, {
    headers: { "Cache-Control": "no-store" },
  });
}
