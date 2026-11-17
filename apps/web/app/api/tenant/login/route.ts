
import { NextResponse } from "next/server";

type TenantLoginResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
};

function errorResponse(message: string, status: number) {
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

export async function POST(request: Request) {
  // 1. Farklı origin'den gönderilen istekleri reddet.
  const origin = request.headers.get("origin");
  const expectedOrigin = new URL(request.url).origin;

  if (origin !== expectedOrigin) {
    return errorResponse("İstek kaynağı geçersiz.", 403);
  }

  // 2. JSON gövdesini oku.
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return errorResponse("Geçersiz JSON verisi.", 400);
  }

  // 3. Giriş bilgilerini kontrol et.
  if (
    typeof body !== "object" ||
    body === null ||
    Array.isArray(body) ||
    !("email" in body) ||
    !("password" in body) ||
    typeof body.email !== "string" ||
    typeof body.password !== "string" ||
    !body.email.includes("@") ||
    body.password.length === 0
  ) {
    return errorResponse(
      "Geçerli e-posta ve şifre giriniz.",
      400,
    );
  }

  try {
    // 4. NestJS'e sunucu tarafında bağlan.
    const apiUrl =
      process.env.API_INTERNAL_URL ??
      "http://localhost:3001";

    const response = await fetch(
      new URL("/auth/tenant/login", apiUrl),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: body.email,
          password: body.password,
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      },
    );

    // 5. Başarısız girişte hesap bilgisi sızdırma.
    if (response.status === 400 || response.status === 401) {
      return errorResponse(
        "E-posta veya şifre hatalı ya da hesap aktif değil.",
        401,
      );
    }

    if (!response.ok) {
      return errorResponse(
        "Giriş servisi şu anda kullanılamıyor.",
        502,
      );
    }

    // 6. Backend yanıtını doğrula.
    const data: unknown = await response.json();

    if (
      typeof data !== "object" ||
      data === null ||
      !("accessToken" in data) ||
      typeof data.accessToken !== "string" ||
      data.accessToken.length === 0 ||
      !("refreshToken" in data) ||
      typeof data.refreshToken !== "string" ||
      data.refreshToken.length === 0 ||
      !("tokenType" in data) ||
      data.tokenType !== "Bearer" ||
      !("expiresIn" in data) ||
      data.expiresIn !== 900
    ) {
      return errorResponse(
        "Giriş servisinden geçersiz cevap alındı.",
        502,
      );
    }

    const loginData = data as TenantLoginResponse;

    // 7. Tarayıcıya token içermeyen yanıt gönder.
    const result = NextResponse.json({
      message: "Giriş başarılı.",
    });

    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict" as const,
      path: "/",
    };

    // 8. Access token: 15 dakika.
    result.cookies.set({
      ...cookieOptions,
      name: "rentacar_tenant_access",
      value: loginData.accessToken,
      maxAge: loginData.expiresIn,
    });

    // 9. Refresh token: en fazla 7 gün.
    result.cookies.set({
      ...cookieOptions,
      name: "rentacar_tenant_refresh",
      value: loginData.refreshToken,
      maxAge: 7 * 24 * 60 * 60,
    });

    result.headers.set("Cache-Control", "no-store");

    return result;
  } catch {
    return errorResponse(
      "Giriş servisine bağlanılamadı.",
      502,
    );
  }
}
