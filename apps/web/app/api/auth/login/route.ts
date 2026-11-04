
import { NextResponse } from "next/server";

type LoginResponse = {
  accessToken: string;
  tokenType: "Bearer";
  expiresIn: number;
};

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const expectedOrigin = new URL(request.url).origin;

  if (origin !== expectedOrigin) {
    return NextResponse.json(
      { message: "İstek kaynağı geçersiz." },
      { status: 403 },
    );
  }

  // 2. İstek gövdesini oku.
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { message: "Geçersiz JSON verisi." },
      { status: 400 },
    );
  }

  // 3. Gelen verileri kontrol et.
  if (
    typeof body !== "object" ||
    body === null ||
    !("email" in body) ||
    !("password" in body) ||
    typeof body.email !== "string" ||
    typeof body.password !== "string" ||
    !body.email.includes("@") ||
    body.password.length === 0
  ) {
    return NextResponse.json(
      { message: "Geçerli e-posta ve şifre giriniz." },
      { status: 400 },
    );
  }

  try {
    // 4. NestJS API adresini belirle.
    const apiUrl =
      process.env.API_INTERNAL_URL ??
      "http://localhost:3001";

    // 5. NestJS'e giriş isteği gönder.
    const response = await fetch(`${apiUrl}/auth/login`, {
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
    });

    // 6. Hatalı giriş bilgileri.
    if (response.status === 400 || response.status === 401) {
      return NextResponse.json(
        { message: "E-posta veya şifre hatalı." },
        { status: 401 },
      );
    }

    if (!response.ok) {
      return NextResponse.json(
        { message: "Giriş servisi şu anda kullanılamıyor." },
        { status: 502 },
      );
    }

    // 7. NestJS cevabını doğrula.
    const data: unknown = await response.json();

    if (
      typeof data !== "object" ||
      data === null ||
      !("accessToken" in data) ||
      typeof data.accessToken !== "string" ||
      data.accessToken.length === 0 ||
      !("tokenType" in data) ||
      data.tokenType !== "Bearer" ||
      !("expiresIn" in data) ||
      data.expiresIn !== 900
    ) {
      return NextResponse.json(
        { message: "Giriş servisinden geçersiz cevap alındı." },
        { status: 502 },
      );
    }

    const loginData = data as LoginResponse;

    // 8. Başarılı HTTP yanıtını oluştur.
    const result = NextResponse.json({
      message: "Giriş başarılı.",
    });

    // 9. JWT'yi HttpOnly cookie olarak sakla.
    result.cookies.set({
      name: "rentacar_admin_session",
      value: loginData.accessToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: loginData.expiresIn,
    });

    result.headers.set("Cache-Control", "no-store");

    return result;
  } catch {
    return NextResponse.json(
      { message: "Giriş servisine bağlanılamadı." },
      { status: 502 },
    );
  }
}
