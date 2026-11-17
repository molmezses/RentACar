
import { Suspense, type ReactNode } from "react";

import AdminSidebar from "./sidebar";
import AdminHeader from "./header";
import AdminMobileNav from "./mobile-nav";

type AdminDashboardLayoutProps = {
  children: ReactNode;
};

export default function AdminDashboardLayout({
  children,
}: AdminDashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f8fa] md:flex-row">
      <Suspense fallback={null}>
        <AdminMobileNav />
      </Suspense>

      <Suspense
        fallback={
          <div className="hidden w-64 shrink-0 md:block" />
        }
      >
        <AdminSidebar />
      </Suspense>

      <div className="min-w-0 flex-1">
        <AdminHeader />
        {children}
      </div>
    </div>
  );
}
