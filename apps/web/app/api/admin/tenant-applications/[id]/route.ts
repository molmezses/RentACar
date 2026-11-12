
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

function jsonResponse(message: string, status: number) {
  return NextResponse.json(
    { message },
    {
      status,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}

export async function DELETE(
  request: Request,
  { params }: RouteContext,
) {
  // İsteğin beklenen origin'den geldiğini doğrula.
  const origin = request.headers.get("origin");
  const expectedOrigin = new URL(request.url).origin;

  if (origin !== expectedOrigin) {
    return jsonResponse("İstek kaynağı geçersiz.", 403);
  }

  // Başvuru ID'sini kontrol et.
  const { id } = await params;

  if (!id || id.length > 128) {
    return jsonResponse("Geçersiz başvuru ID'si.", 400);
  }

  // Platform Admin oturumunu HttpOnly cookie'den al.
  const cookieStore = await cookies();
  const token = cookieStore.get("rentacar_admin_session")?.value;

  if (!token) {
    return jsonResponse(
      "Oturumunuz bulunamadı. Lütfen tekrar giriş yapın.",
      401,
    );
  }

  // İsteği NestJS backend'ine yönlendir.
  const apiUrl =
    process.env.API_INTERNAL_URL ??
    "http://localhost:3001";

  const url = new URL(
    `/admin/tenant-applications/${encodeURIComponent(id)}`,
    apiUrl,
  );

  let response: Response;

  try {
    response = await fetch(url.toString(), {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return jsonResponse(
      "Sunucuya ulaşılamadı. Silme gerçekleşmiş olabilir. Güncel listeyi kontrol edin.",
      502,
    );
  }

  if (response.status === 401) {
    return jsonResponse(
      "Oturumunuzun süresi dolmuş. Lütfen tekrar giriş yapın.",
      401,
    );
  }

  if (response.status === 403) {
    return jsonResponse(
      "Bu işlemi yapma yetkiniz bulunmuyor.",
      403,
    );
  }

  if (response.status === 404) {
    return jsonResponse("Başvuru bulunamadı.", 404);
  }

  if (response.status === 409) {
    return jsonResponse(
      "Bu başvuru artık silinemiyor. Durumu değişmiş veya ilişkili kayıtları olabilir.",
      409,
    );
  }

  if (response.status !== 204) {
    return jsonResponse(
      "Silme sonucunu doğrulayamadık. Güncel listeyi kontrol edin.",
      502,
    );
  }

  // DELETE başarılı: response body olmadan 204 döndür.
  return new Response(null, {
    status: 204,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
