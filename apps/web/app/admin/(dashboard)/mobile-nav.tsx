"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function AdminMobileNav() {
  const [isOpen, setIsOpen] = useState(false);

  const menuButtonRef = useRef<HTMLButtonElement>(null);

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
    <nav
      aria-label="Mobil yönetim menüsü"
      className="relative md:hidden"
    >
      <button
        ref={menuButtonRef}
        type="button"
        aria-expanded={isOpen}
        aria-controls="admin-mobile-menu"
        onClick={() => setIsOpen((previous) => !previous)}
        className="whitespace-nowrap rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
      >
        {isOpen ? "Kapat" : "Menü"}
      </button>

      {isOpen && (
        <div
          id="admin-mobile-menu"
          className="absolute left-0 top-full z-20 mt-2 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg"
        >
          <Link
            href="/admin"
            aria-current="page"
            onClick={() => setIsOpen(false)}
            className="block rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white"
          >
            Dashboard
          </Link>
        </div>
      )}
    </nav>
  );
}