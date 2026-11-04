
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();

  // Formun durumlarını tutuyoruz.
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    // Tarayıcının formu normal şekilde
    // gönderip sayfayı yenilemesini engelle.
    event.preventDefault();

    if (isLoading) return;

    setIsLoading(true);
    setError("");

    // Form içerisindeki verileri oku.
    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    try {
      // Kendi Next.js API'mize istek gönderiyoruz.
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("E-posta veya şifre hatalı.");
        } else {
          setError("Giriş yapılamadı. Lütfen tekrar deneyin.");
        }

        return;
      }

      // Başarılı girişten sonra dashboard'a yönlendir.
      // Dashboard sayfasını sonraki adımda oluşturacağız.
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("Sunucuya bağlanılamadı.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-2xl font-bold text-white">
            R
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            RentACar
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Super Admin Yönetim Paneli
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              E-posta adresi
            </label>

            <input
              id="email"
              name="email"
              type="email"
              autoComplete="username"
              placeholder="admin@example.com"
              required
              disabled={isLoading}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-slate-700"
            >
              Şifre
            </label>

            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Şifrenizi girin"
              required
              disabled={isLoading}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-lg bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>

          <p className="text-center text-xs text-slate-400">
            Yalnızca yetkili platform yöneticileri içindir.
          </p>
        </form>
      </div>
    </main>
  );
}
