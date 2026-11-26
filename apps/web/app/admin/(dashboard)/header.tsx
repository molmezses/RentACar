
import Link from "next/link";

export default function AdminHeader() {
  return (
    <header className="border-b border-slate-200 bg-white px-5 py-5 lg:px-10">
      <div className="flex min-w-0 items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="text-xs text-slate-400">
            Yönetim Paneli / Platform
          </p>

          <Link
            href="/admin"
            className="mt-1 inline-block rounded text-lg font-semibold text-[#19243a] transition hover:text-blue-700 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-blue-600"
          >
            Genel Bakış
          </Link>
        </div>

        <div className="hidden shrink-0 items-center gap-3 md:flex">
          <span className="hidden items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-xs font-medium text-blue-800 lg:flex">
            <span className="h-2 w-2 rounded-full bg-blue-500" />
            Platform Admin
          </span>
        </div>
      </div>
    </header>
  );
}
