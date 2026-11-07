
//Başvuru detay sayfasını gösterir
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import ApplicationActions from "./application-actions";

import { getAdminSession } from "../../admin-session";
import { getTenantApplicationById } from "../../../../../lib/server/tenant-applications";

import type {
  TenantApplicationStatus,
} from "../../../../../types/tenant-application";

import LoadingState from "../../../../../components/ui/loading-state";
import ErrorState from "../../../../../components/ui/error-state";

type DetailPageProps = {
  params: Promise<{ id: string }>;
};

const statusLabels: Record<TenantApplicationStatus, string> = {
  PENDING: "Beklemede",
  APPROVED: "Onaylandı",
  REJECTED: "Reddedildi",
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR", {
    dateStyle: "long",
    timeStyle: "short",
    timeZone: "Europe/Istanbul",
  }).format(new Date(value));
}

async function ApplicationDetail({
  params,
}: DetailPageProps) {
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

  const result = await getTenantApplicationById(id);

  if (!result.ok) {
    if (result.kind === "not-found") {
      notFound();
    }

    return (
      <ErrorState
        title={
          result.kind === "forbidden"
            ? "Erişim reddedildi"
            : "Başvuru bilgileri alınamadı"
        }
        message={result.error}
      />
    );
  }

  const application = result.application;

  const fields = [
    {
      label: "Şirket adı",
      value: application.companyName,
    },
    {
      label: "Şirket slug",
      value: application.slug,
    },
    {
      label: "İletişim kişisi",
      value: application.contactName,
    },
    {
      label: "E-posta",
      value: application.contactEmail,
    },
    {
      label: "Telefon",
      value: application.contactPhone,
    },
    {
      label: "Başvuru tarihi",
      value: formatDate(application.createdAt),
    },
    {
      label: "Son güncelleme",
      value: formatDate(application.updatedAt),
    },
    {
      label: "Tenant ID",
      value: application.tenantId ?? "Henüz yok",
    },
  ];

  return (
    <div className="space-y-6">
      <Link
        href="/admin/applications"
        className="inline-block text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← Başvurulara Dön
      </Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500">
              Şirket başvurusu
            </p>

            <h1 className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              {application.companyName}
            </h1>

            <p className="mt-2 break-all text-xs text-slate-500">
              Başvuru ID: {application.id}
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-800">
            {statusLabels[application.status]}
          </span>
        </div>

        <dl className="mt-8 grid gap-6 border-t border-slate-200 pt-8 sm:grid-cols-2">
          {fields.map((field) => (
            <div
              key={field.label}
              className="min-w-0"
            >
              <dt className="text-sm text-slate-500">
                {field.label}
              </dt>

              <dd className="mt-1 break-words font-medium text-slate-900">
                {field.value}
              </dd>
            </div>
          ))}
        </dl>
       <ApplicationActions
  applicationId={application.id}
  companyName={application.companyName}
  status={application.status}
/>
      </section>
    </div>
  );
}

export default function ApplicationDetailPage({
  params,
}: DetailPageProps) {
  return (
    <main className="p-4 sm:p-8">
      <Suspense
        fallback={
          <LoadingState message="Başvuru detayları yükleniyor..." />
        }
      >
        <ApplicationDetail params={params} />
      </Suspense>
    </main>
  );
}
