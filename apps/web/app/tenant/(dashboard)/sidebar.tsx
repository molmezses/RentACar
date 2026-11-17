
"use client";

import { useState } from "react";
import Link from "next/link";

import TenantLogoutButton from "../logout-button";
import TenantNavIcon from "../tenant-nav-icon";

type TenantSidebarProps = {
  email: string;
};

export default function TenantSidebar({
  email,
}: TenantSidebarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <aside className="w-full shrink-0 bg-[#13241f] text-white md:sticky md:top-0 md:flex md:h-screen md:w-64 md:flex-col">
      {/* LOGO + MOBİL MENÜ BUTONU */}
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4 md:py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-600 text-xl font-bold">
            R
          </div>

          <div>
            <h1 className="text-lg font-bold tracking-tight">
              RentACar
            </h1>
            <p className="text-xs text-emerald-200/60">
              İşletme Yönetimi
            </p>
          </div>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/15 text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-300 md:hidden"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-label={
            mobileMenuOpen ? "Menüyü kapat" : "Menüyü aç"
          }
          aria-expanded={mobileMenuOpen}
          aria-controls="tenant-sidebar-menu"
        >
          {mobileMenuOpen ? (
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
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M4 7h16M4 12h16M4 17h16" />
            </svg>
          )}
        </button>
      </div>

      {/* MENÜ VE HESAP BÖLÜMÜ */}
      <div
        id="tenant-sidebar-menu"
        className={`${
          mobileMenuOpen ? "flex" : "hidden"
        } flex-col md:flex md:min-h-0 md:flex-1`}
      >
        <nav
          aria-label="Şirket yönetimi"
          className="flex-1 space-y-2 px-4 py-7"
        >
          <p className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200/40">
            Yönetim
          </p>

          <Link
            href="/tenant"
            aria-current="page"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-3 rounded-xl bg-[#285344] px-4 py-3 text-sm font-medium text-white"
          >
            <TenantNavIcon name="dashboard" />
            <span>Genel Bakış</span>
          </Link>

          <div className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-[#b7c9c1]">
            <span className="flex items-center gap-3">
              <TenantNavIcon name="car" />
              <span>Araçlar</span>
            </span>
            <span className="text-[10px] text-white/35">
              Yakında
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-[#b7c9c1]">
            <span className="flex items-center gap-3">
              <TenantNavIcon name="calendar" />
              <span>Rezervasyonlar</span>
            </span>
            <span className="text-[10px] text-white/35">
              Yakında
            </span>
          </div>

          <div className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-[#b7c9c1]">
            <span className="flex items-center gap-3">
              <TenantNavIcon name="users" />
              <span>Müşteriler</span>
            </span>
            <span className="text-[10px] text-white/35">
              Yakında
            </span>
          </div>

          <div className="my-5 border-t border-white/10" />

          <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-emerald-200/40">
            İşletme
          </p>

          <div className="flex items-center justify-between rounded-xl px-4 py-3 text-sm text-[#b7c9c1]">
            <span className="flex items-center gap-3">
              <TenantNavIcon name="settings" />
              <span>Ayarlar</span>
            </span>
            <span className="text-[10px] text-white/35">
              Yakında
            </span>
          </div>
        </nav>

        {/* HESAP VE ÇIKIŞ */}
        <div className="border-t border-white/10 p-4">
          <p className="mb-3 truncate px-2 text-xs text-[#b7c9c1]">
            {email}
          </p>

          <TenantLogoutButton />
        </div>
      </div>
    </aside>
  );
}
