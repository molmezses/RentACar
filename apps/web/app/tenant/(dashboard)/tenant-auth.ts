
import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export type TenantAdmin = {
  id: string;
  email: string;
  tenantId: string;
};

async function redirectToTenantLogin(): Promise<never> {
  const cookieStore = await cookies();

  const hasRefreshToken = Boolean(
    cookieStore.get("rentacar_tenant_refresh")?.value,
  );

  redirect(
    hasRefreshToken ? "/tenant/session" : "/tenant/login",
  );
}

export const getTenantAdmin = cache(
  async (): Promise<TenantAdmin> => {
    const cookieStore = await cookies();

    const accessToken = cookieStore.get(
      "rentacar_tenant_access",
    )?.value;

    if (!accessToken) {
      return redirectToTenantLogin();
    }

    const apiUrl =
      process.env.API_INTERNAL_URL ??
      "http://localhost:3001";

    let response: Response;

    try {
      response = await fetch(
        new URL("/auth/tenant/me", apiUrl),
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        },
      );
    } catch {
      throw new Error(
        "Tenant oturum servisine ulaşılamadı.",
      );
    }

    if (response.status === 401) {
      return redirectToTenantLogin();
    }

    if (!response.ok) {
      throw new Error(
        "Tenant oturumu doğrulanamadı.",
      );
    }

    let data: unknown;

    try {
      data = await response.json();
    } catch {
      throw new Error(
        "Oturum servisinden geçersiz yanıt alındı.",
      );
    }

    if (
      typeof data !== "object" ||
      data === null ||
      !("id" in data) ||
      !("email" in data) ||
      !("tenantId" in data) ||
      typeof data.id !== "string" ||
      typeof data.email !== "string" ||
      typeof data.tenantId !== "string" ||
      !data.id ||
      !data.email ||
      !data.tenantId
    ) {
      throw new Error(
        "Oturum bilgileri beklenen biçimde değil.",
      );
    }

    return {
      id: data.id,
      email: data.email,
      tenantId: data.tenantId,
    };
  },
);
