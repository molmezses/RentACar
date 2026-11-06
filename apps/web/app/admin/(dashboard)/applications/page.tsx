
import { Suspense } from "react";
import Link from "next/link";

import { getAdminSession } from "../admin-session";
import { getTenantApplications } from "../../../../lib/server/tenant-applications";

import type { TenantApplicationStatus } from "../../../../types/tenant-application";

import LoadingState from "../../../../components/ui/loading-state";
import ErrorState from "../../../../components/ui/error-state";
import EmptyState from "../../../../components/ui/empty-state";

import ApplicationTable from "./application-table";

type ApplicationsPageProps = {
  searchParams: Promise<{
    status?: string | string[];
  }>;
};

const filters = [
  { label: "Tümü", status: undefined },
  { label: "Bekleyen", status: "PENDING" },
  { label: "Onaylanan", status: "APPROVED" },
  { label: "Reddedilen", status: "REJECTED" },
] as const;

async function ApplicationsContent({
  searchParams,
}: ApplicationsPageProps) {
  const session = await getAdminSession();

  if (!session.ok) {
    return (
      <ErrorState
        title="Oturum kontrolü başarısız"
        message={session.error}
      />
    );
  }

  const params = await searchParams;
  const rawStatus = params.status;

  if (
    rawStatus !== undefined &&
    rawStatus !== "PENDING" &&
    rawStatus !== "APPROVED" &&
    rawStatus !== "REJECTED"
  ) {
    return (
      <ErrorState
        title="Geçersiz durum filtresi"
        message="Lütfen geçerli bir başvuru durumu seçin."
      />
    );
  }

  const selectedStatus: TenantApplicationStatus | undefined =
    rawStatus;

  const result = await getTenantApplications(selectedStatus);

  const filterNavigation = (
    <nav
      aria-label="Başvuru durum filtreleri"
      className="mb-6 flex flex-wrap gap-2"
    >
      {filters.map((filter) => {
        const isActive = selectedStatus === filter.status;

        const href = filter.status
          ? `/admin/applications?status=${filter.status}`
          : "/admin/applications";

        return (
          <Link
            key={filter.label}
            href={href}
            aria-current={isActive ? "page" : undefined}
            className={
              isActive
                ? "rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white"
                : "rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
            }
          >
            {filter.label}
          </Link>
        );
      })}
    </nav>
  );

  if (!result.ok) {
    return (
      <>
        {filterNavigation}
        <ErrorState
          title="Başvurular yüklenemedi"
          message={result.error}
        />
      </>
    );
  }

  return (
    <>
      {filterNavigation}

      {result.applications.length === 0 ? (
        <EmptyState
          title="Bu filtrede başvuru bulunamadı"
          description="Seçilen duruma ait şirket başvurusu bulunmuyor."
        />
      ) : (
        <ApplicationTable applications={result.applications} />
      )}
    </>
  );
}

export default function ApplicationsPage({
  searchParams,
}: ApplicationsPageProps) {
  return (
    <main className="p-4 sm:p-8">
      <h2 className="mb-6 text-2xl font-bold text-slate-900">
        Şirket Başvuruları
      </h2>

      <Suspense
        fallback={
          <LoadingState message="Başvurular yükleniyor..." />
        }
      >
        <ApplicationsContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
