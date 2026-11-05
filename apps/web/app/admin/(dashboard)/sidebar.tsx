import Link from "next/link";

export default function AdminSidebar() {
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

      <nav aria-label="Ana navigasyon">
        <Link
          href="/admin"
          aria-current="page"
          className="block rounded-lg bg-slate-900 px-4 py-3 text-sm font-medium text-white"
        >
          Dashboard
        </Link>
      </nav>
    </aside>
  );
}