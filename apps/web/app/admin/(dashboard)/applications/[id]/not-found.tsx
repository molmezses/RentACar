
import Link from "next/link";

export default function ApplicationNotFound() {
  return (
    <main className="p-4 sm:p-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">
          Başvuru bulunamadı
        </h1>

        <p className="mt-3 text-slate-600">
          Aradığınız şirket başvurusu mevcut değil.
        </p>

        <Link
          href="/admin"
          className="mt-6 inline-block rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white"
        >
          
        ← Dashboard
  
        </Link>
      </div>
    </main>
  );
}
