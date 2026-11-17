
import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";

import TenantLogoutButton from "./logout-button";
import TenantSessionKeeper from "./session-keeper";
import TenantNavIcon from "./tenant-nav-icon";

type TenantAdmin = {
  id: string;
  email: string;
  tenantId: string;
};

async function getTenantAdmin(): Promise<TenantAdmin | null> {
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
      new URL("/auth/tenant/me", apiUrl),
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
      !("email" in data) ||
      !("tenantId" in data) ||
      typeof data.id !== "string" ||
      typeof data.email !== "string" ||
      typeof data.tenantId !== "string"
    ) {
      return null;
    }

    return {
      id: data.id,
      email: data.email,
      tenantId: data.tenantId,
    };
  } catch {
    return null;
  }
}

async function TenantDashboardContent() {
  const admin = await getTenantAdmin();

  if (!admin) {
    const cookieStore = await cookies();

    const hasRefreshToken = Boolean(
      cookieStore.get("rentacar_tenant_refresh")?.value,
    );

    redirect(
      hasRefreshToken
        ? "/tenant/session"
        : "/tenant/login",
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f8f7] text-slate-900">
      <TenantSessionKeeper />

      <div className="flex min-h-screen flex-col md:flex-row">
        {/* SOL SIDEBAR */}
        <aside className="flex w-full shrink-0 flex-col bg-[#13241f] text-white md:sticky md:top-0 md:h-screen md:w-64">
          <div className="border-b border-white/10 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-xl font-bold">
                R
              </div>

              <div>
                <h1 className="text-lg font-bold tracking-tight">
                  RentACar
                </h1>
                <p className="text-xs text-emerald-200/60">
                  İşletme Yönetimi
                </p>
              </div>
            </div>
          </div>

          <nav
            aria-label="Şirket yönetimi"
            className="flex-1 space-y-2 px-4 py-7"
          >
            <p className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200/40">
              Yönetim
            </p>

            <Link
              href="/tenant"
              aria-current="page"
              className="flex items-center gap-3 rounded-xl bg-[#285344] px-4 py-3 text-sm font-medium text-white"
            >
              <TenantNavIcon name="dashboard" />
              <span>Genel Bakış</span>
            </Link>

            <div className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-[#b7c9c1]">
              <span className="flex items-center gap-3">
                <TenantNavIcon name="car" />
                <span>Araçlar</span>
              </span>
              <span className="text-[10px] text-white/35">
                Yakında
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-[#b7c9c1]">
              <span className="flex items-center gap-3">
                <TenantNavIcon name="calendar" />
                <span>Rezervasyonlar</span>
              </span>
              <span className="text-[10px] text-white/35">
                Yakında
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-[#b7c9c1]">
              <span className="flex items-center gap-3">
                <TenantNavIcon name="users" />
                <span>Müşteriler</span>
              </span>
              <span className="text-[10px] text-white/35">
                Yakında
              </span>
            </div>

            <div className="my-5 border-t border-white/10" />

            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200/40">
              İşletme
            </p>

            <div className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-[#b7c9c1]">
              <span className="flex items-center gap-3">
                <TenantNavIcon name="settings" />
                <span>Ayarlar</span>
              </span>
              <span className="text-[10px] text-white/35">
                Yakında
              </span>
            </div>
          </nav>

          <div className="border-t border-white/10 p-4">
            <p className="mb-3 truncate px-2 text-xs text-[#b7c9c1]">
              {admin.email}
            </p>
            <TenantLogoutButton />
          </div>
        </aside>

        {/* SAĞ İÇERİK ALANI */}
        <div className="min-w-0 flex-1">
          {/* ÜST BAR */}
          <header className="flex min-h-20 items-center justify-between border-b border-slate-200 bg-white px-6 lg:px-10">
            <div>
              <p className="text-xs text-slate-400">
                Yönetim Paneli / Genel Bakış
              </p>
              <h2 className="mt-1 text-lg font-semibold text-[#172e26]">
                Genel Bakış
              </h2>
            </div>

            <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-800 sm:flex">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Şirket Hesabı
            </div>
          </header>

          <main className="mx-auto max-w-7xl space-y-8 p-6 lg:p-10">
            {/* KARŞILAMA */}
            <section>
              <h2 className="text-2xl font-bold tracking-tight text-[#172e26]">
                Hoş geldiniz 👋
              </h2>
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

                <h3 className="text-base font-semibold">
                  Araç Yönetimi
                </h3>

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

                <h3 className="text-base font-semibold">
                  Rezervasyonlar
                </h3>

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

                <h3 className="text-base font-semibold">
                  Müşteriler
                </h3>

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
                <h3 className="text-base font-semibold text-[#172e26]">
                  İşletme Bilgileri
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Giriş yaptığınız şirket hesabına ait bilgiler
                </p>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
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
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function TenantDashboardPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f6f8f7]">
          <p className="text-sm text-slate-500">
            Şirket paneli yükleniyor...
          </p>
        </main>
      }
    >
      <TenantDashboardContent />
    </Suspense>
  );
}
