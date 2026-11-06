import Link from "next/link";
import { Suspense } from "react";
import LogoutButton from "../logout-button";
import AdminMobileNav from "./mobile-nav";

export default function AdminHeader() {
  return (
    <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Link
            href="/admin"
            className="inline-block rounded text-xl font-bold text-slate-900 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-900"
          >
            Dashboard
          </Link>

          <p className="mt-1 text-sm text-slate-500">
            Super Admin Yönetim Paneli
          </p>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <Suspense fallback={null}>
      <AdminMobileNav />
        </Suspense>
          <LogoutButton />
        </div>
      </div>
    </header>
  );
}