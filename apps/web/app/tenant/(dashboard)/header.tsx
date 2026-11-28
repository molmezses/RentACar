"use client";

import { usePathname } from "next/navigation";

export default function TenantHeader() {
  const pathname = usePathname();

  let title = "Genel Bakış";

 if (pathname === "/tenant/vehicles") {
  title = "Araç Yönetimi";
} else if (pathname === "/tenant/vehicles/new") {
  title = "Yeni Araç Ekle";
} else if (/^\/tenant\/vehicles\/[^/]+\/edit$/.test(pathname)) {
  title = "Araç Düzenle";
} else if (/^\/tenant\/vehicles\/[^/]+$/.test(pathname)) {
  title = "Araç Detayı";
}
  return (
    <header className="flex min-h-20 items-center justify-between border-b border-slate-200 bg-white px-6 lg:px-10">
      <div>
        <p className="text-xs text-slate-400">
          Yönetim Paneli / {title}
        </p>

        <h2 className="mt-1 text-lg font-semibold text-[#172e26]">
          {title}
        </h2>
      </div>

      <div className="hidden items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-xs font-medium text-emerald-800 sm:flex">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        Şirket Hesabı
      </div>
    </header>
  );
}
