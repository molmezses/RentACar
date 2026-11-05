import type { ReactNode } from "react";
import AdminSidebar from "./sidebar";
import AdminHeader from "./header";

type AdminDashboardLayoutProps = {
  children: ReactNode;
};

export default function AdminDashboardLayout({
  children,
}: AdminDashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <AdminSidebar />

      <div className="min-w-0 flex-1">
        <AdminHeader />

        {children}
      </div>
    </div>
  );
}