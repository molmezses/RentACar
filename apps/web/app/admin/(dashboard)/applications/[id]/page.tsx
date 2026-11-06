import { Suspense } from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";

import { getAdminSession } from "../../admin-session";

import LoadingState from "../../../../../components/ui/loading-state";
import ErrorState from "../../../../../components/ui/error-state";

type ApplicationStatus = "PENDING" | "APPROVED" | "REJECTED";

type TenantApplication = {
  id: string;
  companyName: string;
  slug: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  status: ApplicationStatus;
  tenantId: string | null;
  createdAt: string;
  updatedAt: string;
};

type DetailPageProps = {
  params: Promise<{ id: string }>;
};

function isTenantApplication(value: unknown): value is TenantApplication {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  const data = value as Record<string, unknown>;

  return (
    typeof data.id === "string" &&
    typeof data.companyName === "string" &&
    typeof data.slug === "string" &&
    typeof data.contactName === "string" &&
    typeof data.contactEmail === "string" &&
    typeof data.contactPhone === "string" &&
    ["PENDING", "APPROVED", "REJECTED"].includes(String(data.status)) &&
    (data.tenantId === null || typeof data.tenantId === "string") &&
    typeof data.createdAt === "string" &&
    typeof data.updatedAt === "string" &&
    !Number.isNaN(Date.parse(data.createdAt)) &&
    !Number.isNaN(Date.parse(data.updatedAt))
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

async function ApplicationDetail({ params }: DetailPageProps) {
  const session = await getAdminSession();

  if (!session.ok) {
    return (
      <ErrorState
        title="Yönetim paneline erişilemiyor"
        message={session.error}
      />
    );
  }

  const { id } = await params;

  if (!id || id.length > 128) {
    notFound();
  }

  const cookieStore = await cookies();
  const token = cookieStore.get("rentacar_admin_session")?.value;

  if (!token) {
    redirect("/admin/login");
  }

  const apiUrl = process.env.API_INTERNAL_URL ?? "http://localhost:3001";

  let response: Response;

  try {
    response = await fetch(
      `${apiUrl}/admin/tenant-applications/${encodeURIComponent(id)}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
        signal: AbortSignal.timeout(10000),
      },
    );
  } catch {
    return (
      <ErrorState
        title="Bağlantı hatası"
        message="Başvuru bilgilerine şu anda ulaşılamıyor."
      />
    );
  }

  if (response.status === 401) {
    redirect("/admin/login");
  }

  if (response.status === 404) {
    notFound();
  }

  if (response.status === 403) {
    return (
      <ErrorState
        title="Erişim reddedildi"
        message="Bu başvuruyu görüntüleme yetkiniz yok."
      />
    );
  }

  if (!response.ok) {
    return (
      <ErrorState
        title="Bir hata oluştu"
        message="Başvuru bilgileri alınamadı."
      />
    );
  }

  const data: unknown = await response.json().catch(() => null);

  if (!isTenantApplication(data) || data.id !== id) {
    return (
      <ErrorState
        title="Geçersiz API yanıtı"
        message="Başvuru verileri beklenen biçimde alınamadı."
      />
    );
  }

  const statusLabels: Record<ApplicationStatus, string> = {
    PENDING: "Beklemede",
    APPROVED: "Onaylandı",
    REJECTED: "Reddedildi",
  };

  const fields = [
    { label: "Şirket adı", value: data.companyName },
    { label: "Şirket slug", value: data.slug },
    { label: "İletişim kişisi", value: data.contactName },
    { label: "E-posta", value: data.contactEmail },
    { label: "Telefon", value: data.contactPhone },
    { label: "Başvuru tarihi", value: formatDate(data.createdAt) },
    { label: "Son güncelleme", value: formatDate(data.updatedAt) },
    { label: "Tenant ID", value: data.tenantId ?? "Henüz yok" },
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/admin/applications"
        className="inline-block text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← Back Applications
      </Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Şirket başvurusu
            </p>
            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              {data.companyName}
            </h1>
            <p className="mt-2 break-all text-xs text-slate-500">
              Başvuru ID: {data.id}
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800">
            {statusLabels[data.status]}
          </span>
        </div>

        <dl className="mt-8 grid gap-6 border-t border-slate-200 pt-8 sm:grid-cols-2">
          {fields.map((field) => (
            <div key={field.label} className="min-w-0">
              <dt className="text-sm text-slate-500">{field.label}</dt>
              <dd className="mt-1 break-words font-medium text-slate-900">
                {field.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}

export default function ApplicationDetailPage({ params }: DetailPageProps) {
  return (
    <main className="p-4 sm:p-8">
      <Suspense
        fallback={<LoadingState message="Başvuru detayları yükleniyor..." />}
      >
        <ApplicationDetail params={params} />
      </Suspense>
    </main>
  );
}
