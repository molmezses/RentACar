
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  // İsteğin kendi web sitemizden geldiğini kontrol et.
  const origin = request.headers.get("origin");
  const expectedOrigin = new URL(request.url).origin;

  if (origin !== expectedOrigin) {
    return NextResponse.json(
      { message: "İstek kaynağı geçersiz." },
      { status: 403 },
    );
  }

  const response = new NextResponse(null, {
    status: 204,
  });

  // Tarayıcıdaki oturum çerezini kaldır.
  response.cookies.set({
    name: "rentacar_admin_session",
    value: "",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 0,
  });

  response.headers.set("Cache-Control", "no-store");

  return response;
}
