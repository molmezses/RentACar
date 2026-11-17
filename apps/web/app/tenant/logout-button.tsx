
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function TenantLogoutButton() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");



async function handleLogout() {
  if (isLoading) return;

  setIsLoading(true);
  setError("");

  try {
    const sendLogout = () =>
      fetch("/api/tenant/logout", {
        method: "POST",
        cache: "no-store",
      });

    // Refresh ile logout aynı sekmeler arası
    // kilidi kullanır.
    const response = navigator.locks
      ? await navigator.locks.request(
          "rentacar-tenant-session",
          { mode: "exclusive" },
          sendLogout,
        )
      : await sendLogout();

    if (!response.ok) {
      setError("Çıkış yapılamadı. Tekrar deneyin.");
      return;
    }

    router.replace("/tenant/login");
    router.refresh();
  } catch {
    setError("Sunucuya bağlanılamadı.");
  } finally {
    setIsLoading(false);
  }
}




return (
  <div className="space-y-2">
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/20 disabled:opacity-50"
    >
      <span aria-hidden="true">↪</span>
      {isLoading ? "Çıkış yapılıyor..." : "Çıkış Yap"}
    </button>

    {error && (
      <p role="alert" className="px-2 text-xs text-red-300">
        {error}
      </p>
    )}
  </div>
);

}
