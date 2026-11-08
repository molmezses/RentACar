import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import type {
  TenantApplication,
  TenantApplicationStatus,
} from "../../types/tenant-application";

export type TenantApplicationsResult =
  | { ok: true; applications: TenantApplication[] }
  | { ok: false; error: string };


function isTenantApplication(
  value: unknown,
): value is TenantApplication {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const application = value as Record<string, unknown>;

  return (
    typeof application.id === "string" &&
    application.id.length > 0 &&
    typeof application.companyName === "string" &&
    typeof application.slug === "string" &&
    typeof application.contactName === "string" &&
    typeof application.contactEmail === "string" &&
    typeof application.contactPhone === "string" &&
    (
      application.status === "PENDING" ||
      application.status === "APPROVED" ||
      application.status === "REJECTED"
    ) &&
    (
      application.tenantId === null ||
      typeof application.tenantId === "string"
    ) &&
    typeof application.createdAt === "string" &&
    !Number.isNaN(Date.parse(application.createdAt)) &&
    typeof application.updatedAt === "string" &&
    !Number.isNaN(Date.parse(application.updatedAt))
  );
}

//Başvuru listesini getirir
export async function getTenantApplications(
  status?: TenantApplicationStatus,
): Promise<TenantApplicationsResult> {
  const cookieStore = await cookies();
  const token = cookieStore.get("rentacar_admin_session")?.value;

  if (!token) {
    redirect("/admin/login");
  }

  const apiUrl =
    process.env.API_INTERNAL_URL ?? "http://localhost:3001";

  const url = new URL(
    "/admin/tenant-applications",
    apiUrl,
  );

  if (status) {
    url.searchParams.set("status", status);
  }

  let response: Response;

  try {
    response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return {
      ok: false,
      error: "Şirket başvuruları alınırken sunucuya ulaşılamadı.",
    };
  }

  if (response.status === 401) {
    redirect("/admin/login");
  }

  // Kullanıcının başvuruları görüntüleme yetkisi yoksa.
  if (response.status === 403) {
    return {
      ok: false,
      error: "Şirket başvurularını görüntüleme yetkiniz yok.",
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      error: "Şirket başvuruları alınamadı.",
    };
  }

  const data: unknown = await response.json().catch(() => null);


if (
  !Array.isArray(data) ||
  !data.every(isTenantApplication)
) {
  return {
    ok: false,
    error: "Sunucudan geçersiz başvuru listesi alındı.",
  };
}

return {
  ok: true,
  applications: data,
};

}


export type TenantApplicationDetailResult =
  | { ok: true; application: TenantApplication }
  | {
      ok: false;
      kind: "not-found" | "forbidden" | "error";
      error: string;
    };

//Belirli başvurunun detayını getirir    
export async function getTenantApplicationById(
  id: string,
): Promise<TenantApplicationDetailResult> {
  if (!id || id.length > 128) {
    return {
      ok: false,
      kind: "not-found",
      error: "Başvuru bulunamadı.",
    };
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(
    "rentacar_admin_session",
  )?.value;

  if (!token) {
    redirect("/admin/login");
  }

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
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    return {
      ok: false,
      kind: "error",
      error: "Başvuru bilgilerine şu anda ulaşılamıyor.",
    };
  }

  if (response.status === 401) {
    redirect("/admin/login");
  }

  if (response.status === 404) {
    return {
      ok: false,
      kind: "not-found",
      error: "Başvuru bulunamadı.",
    };
  }

  if (response.status === 403) {
    return {
      ok: false,
      kind: "forbidden",
      error: "Bu başvuruyu görüntüleme yetkiniz yok.",
    };
  }

  if (!response.ok) {
    return {
      ok: false,
      kind: "error",
      error: "Başvuru bilgileri alınamadı.",
    };
  }

  const data: unknown = await response
    .json()
    .catch(() => null);

  if (
    !isTenantApplication(data) ||
    data.id !== id
  ) {
    return {
      ok: false,
      kind: "error",
      error: "Sunucudan geçersiz başvuru verisi alındı.",
    };
  }

  return {
    ok: true,
    application: data,
  };
}
