//Super Admin'in Onayla veya Reddet butonuna basmasıyla gönderilecek PATCH isteklerini karşılar

import { NextResponse } from "next/server";
import { cookies } from "next/headers";


function jsonResponse(
  message: string,
  status = 200,
) {
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


type RouteContext = {
  params: Promise<{
    id: string;
    action: string;
  }>;
};

export async function PATCH(
  request: Request,
  { params }: RouteContext,
) {
  // 1. İsteğin kendi uygulamamızdan geldiğini kontrol et.
  const origin = request.headers.get("origin");
  const expectedOrigin = new URL(request.url).origin;

  if (origin !== expectedOrigin) {
  return jsonResponse("İstek kaynağı geçersiz.", 403);
}

  // 2. URL içerisindeki id ve action değerlerini al.
  const { id, action } = await params;

  // 3. Geçerli bir başvuru ID'si gönderilmiş mi?
  if (!id || id.length > 128) {
  return jsonResponse("Geçersiz başvuru ID'si.", 400);
}

  // 4. Yalnızca izin verdiğimiz işlemler yapılabilir.
  if (action !== "approve" && action !== "reject") {
  return jsonResponse("Geçersiz başvuru işlemi.", 400);
}

  
  // 5. HttpOnly cookie içerisindeki JWT'yi oku.
  const cookieStore = await cookies();

  const token = cookieStore.get(
    "rentacar_admin_session",
  )?.value;

  // 6. Kullanıcı giriş yapmamışsa işlemi durdur.
  if (!token) {
  return jsonResponse(
    "Oturumunuz bulunamadı. Lütfen tekrar giriş yapın.",
    401,
  );
}
 
  // 7. NestJS backend adresini belirle.
  const apiUrl =
    process.env.API_INTERNAL_URL ??
    "http://localhost:3001";

  // 8. Başvurunun onaylama/reddetme adresini oluştur.
  const url = new URL(
    `/admin/tenant-applications/${encodeURIComponent(id)}/${action}`,
    apiUrl,
  );

  // 9. NestJS backend'ine PATCH isteği gönder.
  let response: Response;

  try {
    response = await fetch(url.toString(), {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
  } catch {
  return jsonResponse(
    "Sunucuya ulaşılamadı. İşlemin gerçekleşip gerçekleşmediğini kontrol edin.",
    502,
  );
}

  
  
  // 10. Kullanıcının oturumu geçersizse.
  if (response.status === 401) {
    return jsonResponse(
      "Oturumunuzun süresi dolmuş. Lütfen tekrar giriş yapın.",
      401,
    );
  }


 
  // 11. Kullanıcının yetkisi yoksa.
  if (response.status === 403) {
    return jsonResponse(
      "Bu işlemi yapma yetkiniz bulunmuyor.",
      403,
    );
  }

  // 12. Başvuru bulunamadıysa.
  if (response.status === 404) {
    return jsonResponse(
      "Başvuru bulunamadı.",
      404,
    );
  }

  // 13. Başvuru daha önce işlenmişse veya işlem çakışmışsa.
  if (response.status === 409) {
    return jsonResponse(
      "Başvuru zaten işlenmiş olabilir veya işlem çakışması yaşandı. Güncel durumu kontrol edin.",
      409,
    );
  }

  // 14. Diğer backend hataları.
  if (!response.ok) {
    return jsonResponse(
      "İşlem tamamlanamadı. Lütfen başvurunun durumunu kontrol edin.",
      502,
    );
  }

  // 15. Başarılı backend yanıtını oku.
  const data: unknown = await response.json().catch(() => null);

  // 16. Gelen verinin nesne olup olmadığını kontrol et.
  if (typeof data !== "object" || data === null || Array.isArray(data)) {
    return jsonResponse(
      "Sunucudan geçersiz işlem sonucu alındı. Güncel durumu kontrol edin.",
      502,
    );
  }

  const result = data as Record<string, unknown>;

  // 17. Onaylama yanıtını doğrula.
  if (action === "approve") {
    const application = result.application;
    const tenant = result.tenant;

    if (
      typeof application !== "object" ||
      application === null ||
      !("id" in application) ||
      application.id !== id ||
      !("status" in application) ||
      application.status !== "APPROVED" ||
      typeof tenant !== "object" ||
      tenant === null ||
      !("id" in tenant) ||
      typeof tenant.id !== "string"
    ) {
      return jsonResponse(
        "Onaylama sonucunu doğrulayamadık. Başvurunun güncel durumunu kontrol edin.",
        502,
      );
    }
  }

  // 18. Reddetme yanıtını doğrula.
  if (action === "reject") {
    if (
      !("id" in result) ||
      result.id !== id ||
      !("status" in result) ||
      result.status !== "REJECTED"
    ) {
      return jsonResponse(
        "Reddetme sonucunu doğrulayamadık. Başvurunun güncel durumunu kontrol edin.",
        502,
      );
    }
  }

  // 19. İşlem başarılı.
  return jsonResponse(
    action === "approve"
      ? "Başvuru başarıyla onaylandı."
      : "Başvuru başarıyla reddedildi.",
  );
}




