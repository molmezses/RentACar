"use client";

import { useState } from "react";

export default function LogoutButton() {
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
    <div className="mt-6">
      <button
        type="button"
        onClick={handleLogout}
        disabled={isLoading}
        className="rounded-lg bg-red-600 px-5 py-3 font-medium text-white hover:bg-red-700 disabled:opacity-60"
      >
        {isLoading ? "Çıkış yapılıyor..." : "Çıkış Yap"}
      </button>

      {error && (
        <p role="alert" className="mt-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}
