
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "../logout-button";

type AdminIconName = "dashboard" | "applications";

function AdminNavIcon({ name }: { name: AdminIconName }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="h-5 w-5 shrink-0"
    >
      {name === "dashboard" ? (
        <>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </>
      ) : (
        <>
          <rect x="4" y="5" width="16" height="16" rx="2" />
          <path d="M9 5.5V3h6v2.5" />
          <path d="M8 11h8M8 15h8M8 18h5" />
        </>
      )}
    </svg>
  );
}

const links = [
  {
    href: "/admin",
    label: "Genel Bakış",
    icon: "dashboard",
  },
  {
    href: "/admin/applications",
    label: "Şirket Başvuruları",
    icon: "applications",
  },
] as const;

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside
      aria-label="Yönetim menüsü"
      className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col self-start overflow-y-auto bg-[#19243a] text-white md:flex"
>
      {/* Marka alanı */}
      <div className="border-b border-white/10 px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#304767] text-xl font-bold text-blue-200">
            R
          </div>

          <div>
            <p className="text-lg font-bold tracking-tight">
              RentACar
            </p>
            <p className="text-xs text-[#a9b9d3]">
              Platform Yönetimi
            </p>
          </div>
        </div>
      </div>

      {/* Menü */}
      <nav
        aria-label="Ana navigasyon"
        className="flex-1 space-y-2 px-4 py-7"
      >
        <p className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a9b9d3]/60">
          Yönetim
        </p>

        {links.map((link) => {
          const isActive =
            link.href === "/admin"
              ? pathname === "/admin"
              : pathname === link.href ||
                pathname.startsWith(`${link.href}/`);

          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive ? "page" : undefined}
              className={
                isActive
                  ? "flex items-center gap-3 rounded-xl bg-[#304767] px-4 py-3 text-sm font-medium text-white"
                  : "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-[#bbc9dd] transition hover:bg-white/10 hover:text-white"
              }
            >
              <AdminNavIcon name={link.icon} />
              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto border-t border-white/10 px-4 py-5">
        <LogoutButton variant="sidebar" />
      </div>
    </aside>
  );
}
