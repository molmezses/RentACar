
import Link from "next/link";
import { Suspense } from "react";

import { getAdminSession } from "../../admin-session";
import ErrorState from "../../../../../components/ui/error-state";
import LoadingState from "../../../../../components/ui/loading-state";

type ApplicationDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

async function ApplicationDetailContent({
  params,
}: ApplicationDetailPageProps) {
  const session = await getAdminSession();

  if (!session.ok) {
    return (
      <ErrorState
        title="Başvuru detayına erişilemiyor"
        message={session.error}
      />
    );
  }

  const { id } = await params;

  return (
    <>
      <Link
        href="/admin/applications"
        className="text-sm font-medium text-slate-600 hover:text-slate-900"
      >
        ← Başvurulara Dön
      </Link>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6">
        <h1 className="text-2xl font-bold text-slate-900">
          Başvuru Detayı
        </h1>

        <p className="mt-4 text-sm text-slate-600">
          Başvuru ID: {id}
        </p>

        <p className="mt-4 text-sm text-slate-500">
          Başvuru detayları sonraki geliştirmede eklenecek.
        </p>
      </section>
    </>
  );
}

export default function ApplicationDetailPage({
  params,
}: ApplicationDetailPageProps) {
  return (
    <main className="p-4 sm:p-8">
      <Suspense
        fallback={
          <LoadingState message="Başvuru detayı yükleniyor..." />
        }
      >
        <ApplicationDetailContent params={params} />
      </Suspense>
    </main>
  );
}
