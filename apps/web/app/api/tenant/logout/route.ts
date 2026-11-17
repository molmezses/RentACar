
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ACCESS_COOKIE = "rentacar_tenant_access";
const REFRESH_COOKIE = "rentacar_tenant_refresh";

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

function errorResponse(message: string, status: number) {
  return NextResponse.json(
    { message },
    {
      status,
      headers: { "Cache-Control": "no-store" },
    },
  );
}

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const expectedOrigin = new URL(request.url).origin;

  if (origin !== expectedOrigin) {
    return errorResponse("İstek kaynağı geçersiz.", 403);
  }

  const cookieStore = await cookies();
  const accessToken = cookieStore.get(ACCESS_COOKIE)?.value;
  const refreshToken = cookieStore.get(REFRESH_COOKIE)?.value;

  const apiUrl =
    process.env.API_INTERNAL_URL ?? "http://localhost:3001";

  const success = () =>
    clearSessionCookies(
      NextResponse.json(
        { message: "Oturum kapatıldı." },
        {
          headers: { "Cache-Control": "no-store" },
        },
      ),
    );

  async function revokeSession(token: string) {
    return fetch(new URL("/auth/tenant/logout", apiUrl), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
  }

  try {
    // 1. Mevcut access token ile oturumu kapatmayı dene.
    if (accessToken) {
      const response = await revokeSession(accessToken);

      if (response.ok) {
        return success();
      }

      if (response.status !== 401) {
        return errorResponse(
          "Oturum kapatılamadı. Tekrar deneyin.",
          502,
        );
      }
    }

    // 2. Access token geçersizse refresh token'ı kullan.
    if (refreshToken) {
      const refreshResponse = await fetch(
        new URL("/auth/tenant/refresh", apiUrl),
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        },
      );

      // Oturum zaten geçersiz veya sona ermiş.
      if (refreshResponse.status === 401) {
        return success();
      }

      if (!refreshResponse.ok) {
        return errorResponse(
          "Oturum kapatılamadı. Tekrar deneyin.",
          502,
        );
      }

      const data: unknown = await refreshResponse.json();

      if (
        typeof data !== "object" ||
        data === null ||
        !("accessToken" in data) ||
        typeof data.accessToken !== "string" ||
        data.accessToken.length === 0
      ) {
        return errorResponse(
          "Oturum servisinden geçersiz yanıt alındı.",
          502,
        );
      }

      const logoutResponse = await revokeSession(
        data.accessToken,
      );

      if (!logoutResponse.ok && logoutResponse.status !== 401) {
        return errorResponse(
          "Oturum kapatılamadı. Tekrar deneyin.",
          502,
        );
      }
    }

    // 3. Backend oturumu kapalı veya zaten geçersiz.
    return success();
  } catch {
    return errorResponse(
      "Oturum servisine bağlanılamadı.",
      502,
    );
  }
}
