import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type AdminProfile = {
  id: string;
  email: string;
};

export type AdminSessionResult =
  | { ok: true; admin: AdminProfile }
  | { ok: false; error: string };

export async function getAdminSession(): Promise<AdminSessionResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get("rentacar_admin_session")?.value;

  if (!token) {
    redirect("/admin/login");
  }

  const apiUrl =
    process.env.API_INTERNAL_URL ?? "http://localhost:3001";

  let response: Response;

  try {
    response = await fetch(`${apiUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return {
      ok: false,
      error: "Yönetim servisine şu anda ulaşılamıyor.",
    };
  }

  if (response.status === 401) {
    redirect("/admin/login");
  }


  // Kullanıcının yönetim paneline erişim yetkisi yoksa.
  if (response.status === 403) {
    return {
      ok: false,
      error: "Yönetim paneline erişim yetkiniz bulunmuyor.",
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      error: "Yönetici bilgileri alınamadı.",
    };
  }

  const data: unknown = await response.json().catch(() => null);

  if (
    typeof data !== "object" ||
    data === null ||
    !("id" in data) ||
    !("email" in data) ||
    typeof data.id !== "string" ||
    typeof data.email !== "string" ||
    data.id.length === 0 ||
    data.email.length === 0
  ) {
    return {
      ok: false,
      error: "Yönetici bilgileri geçersiz biçimde alındı.",
    };
  }

  return {
    ok: true,
    admin: {
      id: data.id,
      email: data.email,
    },
  };
}