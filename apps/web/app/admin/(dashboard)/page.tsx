import { Suspense } from "react";
import { getAdminSession } from "./admin-session";
import LoadingState from "../../../components/ui/loading-state";
import ErrorState from "../../../components/ui/error-state";
import EmptyState from "../../../components/ui/empty-state";

async function ProtectedAdminContent() {
  const session = await getAdminSession();

  if (!session.ok) {
    return (
      <main className="p-4 sm:p-8">
       <ErrorState
        title="Yönetim paneline erişilemiyor"
        message={session.error}
      />
      </main>
    );
  }

  return (
    <main className="p-4 sm:p-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-medium text-slate-500">
          RentACar
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Super Admin Paneli
        </h1>

        <p className="mt-4 text-slate-600">
          Giriş başarılı. Hoş geldiniz!
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Yönetici: {session.admin.email}
        </p>
        <section
  aria-label="Dashboard içerik durumu"
  className="mt-8"
>
  <EmptyState
    title="Dashboard'a hoş geldiniz"
    description="Yönetim panelinin ortak arayüzü hazırlanıyor. Başvuru yönetimi özellikleri sonraki geliştirmelerde eklenecek."
  />
</section>
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <Suspense
  fallback={
    <div className="p-4 sm:p-8">
      <LoadingState message="Oturum doğrulanıyor..." />
    </div>
  }
>
  <ProtectedAdminContent />
</Suspense>
  );
}