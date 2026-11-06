"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Dashboard" },
    { href: "/admin/applications", label: "Şirket Başvuruları" },
  ];

  return (
    <aside
      aria-label="Yönetim menüsü"
      className="hidden min-h-screen w-64 shrink-0 border-r border-slate-200 bg-white p-6 md:block"
    >
      <div className="mb-10">
        <p className="text-xl font-bold text-slate-900">
          RentACar
        </p>
        <p className="mt-1 text-xs text-slate-500">
          Super Admin
        </p>
      </div>

      <nav aria-label="Ana navigasyon" className="space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "block rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white"
                  : "block rounded-lg px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
              }
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}