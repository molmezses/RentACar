
import type { ReactNode } from "react";
import { Suspense } from "react";

import TenantSessionKeeper from "../session-keeper";
import TenantSidebar from "./sidebar";
import TenantHeader from "./header";
import { getTenantAdmin } from "./tenant-auth";

type TenantDashboardLayoutProps = {
  children: ReactNode;
};

async function TenantDashboardFrame({
  children,
}: TenantDashboardLayoutProps) {
  const admin = await getTenantAdmin();

  return (
    <div className="min-h-screen bg-[#f6f8f7] text-slate-900">
      <TenantSessionKeeper />

      <div className="flex min-h-screen flex-col md:flex-row">
        <TenantSidebar email={admin.email} />

        <div className="min-w-0 flex-1">
          <TenantHeader />
          {/*Hangi Tenant sayfasına gidersek onun içeriğini gösterir*/}
          {children}
        </div>
      </div>
    </div>
  );
}

export default function TenantDashboardLayout({
  children,
}: TenantDashboardLayoutProps) {
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
      <TenantDashboardFrame>
        {children}
      </TenantDashboardFrame>
    </Suspense>
  );
}
