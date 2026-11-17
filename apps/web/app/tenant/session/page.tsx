
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const SESSION_LOCK_NAME = "rentacar-tenant-session";

export default function TenantSessionPage() {
  const router = useRouter();
  const startedRef = useRef(false);

  const [error, setError] = useState("");

  useEffect(() => {
    // React Strict Mode aynı effect'i yeniden çalıştırsa
    // bile bu component örneğinde ikinci istek başlatma.
    if (startedRef.current) return;

    startedRef.current = true;

    async function restoreSession() {
      try {
        const sendRefresh = () =>
          fetch("/api/tenant/refresh", {
            method: "POST",
            cache: "no-store",
          });

        // SessionKeeper ve logout ile aynı kilidi kullan.
        // Kilit varsa yeni refresh isteği sıraya girer.
        const response = navigator.locks
          ? await navigator.locks.request(
              SESSION_LOCK_NAME,
              { mode: "exclusive" },
              sendRefresh,
            )
          : await sendRefresh();

        if (response.ok) {
          // Next.js yeni HttpOnly cookie'leri kaydetti.
          // Kullanıcıyı yeniden korumalı panele gönder.
          router.replace("/tenant");
          router.refresh();
          return;
        }

        if (response.status === 401) {
          // Backend oturumun geçersiz olduğunu bildirdi.
          router.replace("/tenant/login");
          router.refresh();
          return;
        }

        // Geçici servis hatalarında doğrudan logout yapma.
        setError(
          "Oturum yenilenemedi. Lütfen tekrar deneyin.",
        );
      } catch {
        setError(
          "Oturum servisine bağlanılamadı.",
        );
      }
    }

    void restoreSession();
  }, [router]);

  function retry() {
    window.location.reload();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f6f8f7] px-4">
      <div className="w-full max-w-sm rounded-3xl border border-emerald-100 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-700 text-2xl font-bold text-white">
          R
        </div>

        <h1 className="text-xl font-bold text-slate-900">
          RentACar
        </h1>

        {error ? (
          <div className="mt-5 space-y-4">
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>

            <button
              type="button"
              onClick={retry}
              className="rounded-xl bg-emerald-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Tekrar Dene
            </button>
          </div>
        ) : (
          <div role="status" className="mt-5 space-y-3">
            <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-emerald-100 border-t-emerald-700" />

            <p className="text-sm text-slate-500">
              Oturumunuz kontrol ediliyor...
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
