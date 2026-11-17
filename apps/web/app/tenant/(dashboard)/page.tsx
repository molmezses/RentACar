
import { Suspense } from "react";
import { cookies } from "next/headers";

import { getTenantAdmin } from "./tenant-auth";

type TenantProfile = {
  id: string;
  name: string;
  slug: string;
  status: string;
};

async function getTenantProfile(
  tenantId: string,
): Promise<TenantProfile | null> {
  const cookieStore = await cookies();

  const accessToken = cookieStore.get(
    "rentacar_tenant_access",
  )?.value;

  if (!accessToken) {
    return null;
  }

  const apiUrl =
    process.env.API_INTERNAL_URL ??
    "http://localhost:3001";

  try {
    const response = await fetch(
      new URL("/tenant/profile", apiUrl),
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      },
    );

    if (!response.ok) {
      return null;
    }

    const data: unknown = await response.json();

    if (
      typeof data !== "object" ||
      data === null ||
      !("id" in data) ||
      !("name" in data) ||
      !("slug" in data) ||
      !("status" in data) ||
      typeof data.id !== "string" ||
      typeof data.name !== "string" ||
      typeof data.slug !== "string" ||
      typeof data.status !== "string" ||
      !data.name.trim() ||
      data.id !== tenantId
    ) {
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      slug: data.slug,
      status: data.status,
    };
  } catch {
    return null;
  }
}

async function TenantOverviewContent() {
  const admin = await getTenantAdmin();

  const tenant = await getTenantProfile(
    admin.tenantId,
  );

  return (
    <main className="mx-auto max-w-7xl space-y-8 p-6 lg:p-10">
      {/* KARŞILAMA */}
      <section>
        <h1 className="text-2xl font-bold tracking-tight text-[#172e26]">
          Hoş geldiniz 👋
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          İşletmenizin genel durumunu ve yönetim
          alanlarını buradan takip edebilirsiniz.
        </p>
      </section>

      {/* YÖNETİM KARTLARI */}
      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-2xl">
            🚗
          </div>

          <h2 className="text-base font-semibold">
            Araç Yönetimi
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Filonuzdaki araçları görüntüleyin ve yönetin.
          </p>

          <p className="mt-5 text-xs font-medium text-emerald-700">
            Yakında
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-2xl">
            📅
          </div>

          <h2 className="text-base font-semibold">
            Rezervasyonlar
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Kiralama taleplerini ve rezervasyonları takip edin.
          </p>

          <p className="mt-5 text-xs font-medium text-emerald-700">
            Yakında
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-2xl">
            👥
          </div>

          <h2 className="text-base font-semibold">
            Müşteriler
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Müşteri kayıtlarını ve kiralama geçmişini yönetin.
          </p>

          <p className="mt-5 text-xs font-medium text-emerald-700">
            Yakında
          </p>
        </div>
      </section>

      {/* HESAP BİLGİLERİ */}
      <section className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-base font-semibold text-[#172e26]">
            İşletme Bilgileri
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Giriş yaptığınız şirket hesabına ait bilgiler
          </p>
        </div>

        {!tenant && (
          <p
            role="status"
            className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
          >
            Şirket bilgileri şu anda alınamıyor.
            Lütfen daha sonra tekrar deneyin.
          </p>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs font-medium text-slate-400">
              Şirket Adı
            </p>

            <p className="mt-2 text-sm font-semibold text-[#172e26]">
              {tenant?.name ?? "Bilgi alınamadı"}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400">
              Yönetici E-postası
            </p>

            <p className="mt-2 break-all text-sm font-medium">
              {admin.email}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400">
              Şirket Kimliği
            </p>

            <p className="mt-2 break-all font-mono text-xs text-slate-700">
              {admin.tenantId}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-400">
              Şirket Durumu
            </p>

            <p className="mt-2 text-sm font-medium text-slate-700">
              {tenant?.status ?? "Bilgi alınamadı"}
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default function TenantDashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto max-w-7xl p-6 lg:p-10">
          <p className="text-sm text-slate-500">
            Genel bakış yükleniyor...
          </p>
        </main>
      }
    >
      <TenantOverviewContent />
    </Suspense>
  );
}
