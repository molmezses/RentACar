
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const expectedOrigin = new URL(request.url).origin;

  const jsonError = (message: string, status: number) =>
    NextResponse.json(
      { message },
      {
        status,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );

  // 1. Yalnızca aynı origin üzerinden gelen isteklere izin ver.
  if (origin !== expectedOrigin) {
    return jsonError("İstek kaynağı geçersiz.", 403);
  }

  // 2. İstek gövdesini oku.
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return jsonError("Geçersiz JSON verisi.", 400);
  }

  // 3. Token ve şifre alanlarını doğrula.
  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body) ||
    !("token" in body) ||
    !("password" in body) ||
    typeof body.token !== "string" ||
    typeof body.password !== "string" ||
    !/^[A-Za-z0-9_-]{43}$/.test(body.token) ||
    body.password.length < 12 ||
    body.password.length > 128
  ) {
    return jsonError(
      "Geçerli aktivasyon bağlantısı ve 12-128 karakterlik şifre gereklidir.",
      400,
    );
  }

  // 4. NestJS backend'ine aktivasyon isteği gönder.
  try {
    const apiUrl =
      process.env.API_INTERNAL_URL ?? "http://localhost:3001";

    const response = await fetch(
      new URL("/auth/tenant/activate", apiUrl),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token: body.token,
          password: body.password,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      },
    );

    if (response.status === 400) {
      return jsonError(
        "Aktivasyon bağlantısı geçersiz, kullanılmış veya süresi dolmuş olabilir.",
        400,
      );
    }

    if (!response.ok) {
      return jsonError(
        "Aktivasyon işlemi gerçekleştirilemedi. Lütfen tekrar deneyin.",
        502,
      );
    }

    // 5. Kullanıcıya token içermeyen bir başarı yanıtı dön.
    return NextResponse.json(
      {
        message: "Hesabınız başarıyla etkinleştirildi.",
      },
      {
        status: 200,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );
  } catch {
    return jsonError(
      "Aktivasyon servisine bağlanılamadı.",
      502,
    );
  }
}
