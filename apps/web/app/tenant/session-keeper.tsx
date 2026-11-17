
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const REFRESH_INTERVAL_MS = 5 * 60 * 1000;

export default function TenantSessionKeeper() {
  const router = useRouter();

  useEffect(() => {
    let stopped = false;
    let inFlight = false;
    let lastAttemptAt = Date.now();

    async function renewSession() {
      // Aynı bileşen içinde ikinci isteği başlatma.
      if (stopped || inFlight) return;

      // Arka plandaki sekmeler yenileme yapmasın.
      if (document.visibilityState !== "visible") return;

      // Sekmeler arası kilitleme desteklenmiyorsa
      // eşzamanlı refresh riski almadan mevcut
      // /tenant/session kurtarma akışını kullan.
      if (!navigator.locks) return;

      inFlight = true;
      lastAttemptAt = Date.now();

      try {
        await navigator.locks.request(
          "rentacar-tenant-session",
          { mode: "exclusive" },
          async () => {
            if (stopped) return;

            // Kilit alındıktan sonra isteği gönder.
            // Böylece diğer sekmede cookie güncellendiyse
            // yeni cookie değeriyle istek yapılır.
            const response = await fetch(
              "/api/tenant/refresh",
              {
                method: "POST",
                cache: "no-store",
              },
            );

            if (stopped) return;

            if (response.status === 401) {
              router.replace("/tenant/login");
              router.refresh();
            }

            // 200: Cookie'ler güncellendi.
            // 502: Oturum geçersiz sayılmaz;
            // sonraki kontrolde yeniden denenir.
          },
        );
      } catch {
        // Geçici ağ veya API hatasında oturumu
        // doğrudan kapatmıyoruz.
      } finally {
        inFlight = false;
      }
    }

    // Panel açıkken periyodik yenileme.
    const intervalId = window.setInterval(() => {
      void renewSession();
    }, REFRESH_INTERVAL_MS);

    // Kullanıcı uzun süre sonra sekmeye dönerse
    // geçmiş yenileme aralığını kontrol et.
    function handleVisibilityChange() {
      if (
        document.visibilityState === "visible" &&
        Date.now() - lastAttemptAt >= REFRESH_INTERVAL_MS
      ) {
        void renewSession();
      }
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange,
    );

    return () => {
      stopped = true;
      window.clearInterval(intervalId);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange,
      );
    };
  }, [router]);

  // Görünür bir arayüz oluşturmuyor.
  return null;
}
