
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ACCESS_COOKIE = "rentacar_tenant_access";
const REFRESH_COOKIE = "rentacar_tenant_refresh";

const REFRESH_MAX_AGE = 7 * 24 * 60 * 60;

type RefreshResponse = {
  accessToken: string;
  refreshToken: string;
  tokenType: "Bearer";
  expiresIn: number;
};

function createError(message: string, status: number) {
  return NextResponse.json(
    { message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

function clearSessionCookies(response: NextResponse) {
  for (const name of [ACCESS_COOKIE, REFRESH_COOKIE]) {
    response.cookies.set({
      name,
      value: "",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 0,
    });
  }

  return response;
}

export async function POST(request: Request) {
  // 1. İsteğin kendi sitemizden geldiğini kontrol et.
  const origin = request.headers.get("origin");
  const expectedOrigin = new URL(request.url).origin;

  if (origin !== expectedOrigin) {
    return createError("İstek kaynağı geçersiz.", 403);
  }

  // 2. Refresh token'ı HttpOnly cookie'den oku.
  const cookieStore = await cookies();

  const refreshToken = cookieStore.get(
    REFRESH_COOKIE,
  )?.value;

  if (!refreshToken) {
    return clearSessionCookies(
      createError("Oturum bulunamadı.", 401),
    );
  }

  // 3. NestJS'e refresh isteğini gönder.
  const apiUrl =
    process.env.API_INTERNAL_URL ?? "http://localhost:3001";

  let response: Response;

  try {
    response = await fetch(
      new URL("/auth/tenant/refresh", apiUrl),
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      },
    );
  } catch {
    return createError(
      "Oturum yenileme servisine bağlanılamadı.",
      502,
    );
  }

  // 4. Backend oturumun geçersiz olduğunu doğruladı.
  if (response.status === 401) {
    return clearSessionCookies(
      createError(
        "Oturumunuz sona erdi. Yeniden giriş yapın.",
        401,
      ),
    );
  }

  if (!response.ok) {
    return createError(
      "Oturum yenilenemedi. Tekrar deneyin.",
      502,
    );
  }

  // 5. Backend'den gelen yeni token çiftini doğrula.
  let data: unknown;

  try {
    data = await response.json();
  } catch {
    return createError(
      "Oturum servisinden geçersiz cevap alındı.",
      502,
    );
  }

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
    return createError(
      "Oturum servisinden geçersiz cevap alındı.",
      502,
    );
  }

  const tokens = data as RefreshResponse;

  // 6. Yeni cookie'leri aynı HTTP yanıtında kaydet.
  const result = NextResponse.json(
    { message: "Oturum yenilendi." },
    {
      headers: { "Cache-Control": "no-store" },
    },
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict" as const,
    path: "/",
  };

  result.cookies.set({
    ...cookieOptions,
    name: ACCESS_COOKIE,
    value: tokens.accessToken,
    maxAge: tokens.expiresIn,
  });

  result.cookies.set({
    ...cookieOptions,
    name: REFRESH_COOKIE,
    value: tokens.refreshToken,
    maxAge: REFRESH_MAX_AGE,
  });

  return result;
}
