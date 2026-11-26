"use client";

import { useState } from "react";

type LogoutButtonProps = {
  variant?: "default" | "sidebar";
};

export default function LogoutButton({
  variant = "default",
}: LogoutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogout() {
    if (isLoading) return;

    setIsLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        cache: "no-store",
      });

      if (!response.ok) {
        setError("Çıkış yapılamadı. Lütfen tekrar deneyin.");
        return;
      }

      // Tam sayfa yönlendirmesiyle eski admin ekranını
      // tarayıcı belleğinden de uzaklaştırıyoruz.
      window.location.replace("/admin/login");
    } catch {
      setError("Sunucuya bağlanılamadı.");
    } finally {
      setIsLoading(false);
    }
  }

return (
  <div className={variant === "sidebar" ? "w-full" : "flex flex-col items-start gap-2"}>
    <button
      type="button"
      onClick={handleLogout}
      disabled={isLoading}
      className={
        variant === "sidebar"
          ? "flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60"
          : "rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-red-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:cursor-not-allowed disabled:opacity-60"
      }
    >
      {variant === "sidebar" && (
        <span aria-hidden="true">↪</span>
      )}
      
      <span>{isLoading ? "Çıkış yapılıyor..." : "Çıkış Yap"}</span>
    </button>

    {error && (
      <p
        role="alert"
        className={
          variant === "sidebar"
            ? "flex w-full items-center justify-center gap-2 rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white disabled:cursor-not-allowed disabled:opacity-60"
            : "max-w-60 text-sm text-red-700"
        }
      >
        {error}
      </p>
    )}
  </div>
);

}
