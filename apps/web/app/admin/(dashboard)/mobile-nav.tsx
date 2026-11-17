
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import LogoutButton from "../logout-button";

const links = [
  { href: "/admin", label: "Genel Bakış" },
  { href: "/admin/applications", label: "Şirket Başvuruları" },
] as const;

export default function AdminMobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!isOpen) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        menuButtonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className="w-full bg-[#19243a] text-white md:hidden">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
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

        <button
          ref={menuButtonRef}
          type="button"
          onClick={() => setIsOpen((open) => !open)}
          aria-expanded={isOpen}
          aria-controls="admin-mobile-menu"
          aria-label={isOpen ? "Menüyü kapat" : "Menüyü aç"}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 text-white transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-300"
        >
          {isOpen ? (
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

      {isOpen && (
        <div
          id="admin-mobile-menu"
          className="space-y-3 px-4 py-6"
        >
          <nav
            aria-label="Mobil platform yönetimi"
            className="space-y-2"
          >
            <p className="mb-4 px-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#a9b9d3]/60">
              Yönetim
            </p>

            {links.map((link) => {
              const active =
                link.href === "/admin"
                  ? pathname === "/admin"
                  : pathname === link.href ||
                    pathname.startsWith(`${link.href}/`);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  aria-current={active ? "page" : undefined}
                  onClick={() => setIsOpen(false)}
                  className={
                    active
                      ? "flex items-center rounded-xl bg-[#304767] px-4 py-3 text-sm font-medium text-white"
                      : "flex items-center rounded-xl px-4 py-3 text-sm font-medium text-[#bbc9dd] transition hover:bg-white/10 hover:text-white"
                  }
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-white/10 pt-4">
            <p className="mb-3 px-2 text-xs text-[#a9b9d3]">
              Platform Yönetimi
            </p>
            <LogoutButton />
          </div>
        </div>
      )}
    </div>
  );
}
