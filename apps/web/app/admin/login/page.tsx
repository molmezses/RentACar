
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
  <main className="grid min-h-screen bg-[#f8fafc] lg:grid-cols-2">
    {/* SOL: GİRİŞ FORMU */}
    <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10">
      <div className="w-full max-w-md">
        <div className="mb-12 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#304767] text-xl font-bold text-white">
            R
          </div>

          <div>
            <p className="text-lg font-bold tracking-tight text-[#19243a]">
              RentACar
            </p>
            <p className="text-xs text-slate-500">
              Platform Yönetimi
            </p>
          </div>
        </div>

        <div className="mb-9">
          <h1 className="text-3xl font-bold tracking-tight text-[#19243a]">
            Tekrar hoş geldiniz
          </h1>

          <p className="mt-3 text-sm text-slate-500">
            Platform yönetim panelinize giriş yapın.
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
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
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
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
            />
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-xl bg-[#304767] px-4 py-3.5 font-semibold text-white transition hover:bg-[#253c5c] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </button>

          <p className="text-center text-xs text-slate-400">
            Yalnızca yetkili platform yöneticileri içindir.
          </p>
        </form>
      </div>
    </section>

    {/* SAĞ: PLATFORM TANITIMI */}
    <section className="relative hidden overflow-hidden bg-[#19243a] px-14 lg:flex lg:items-center xl:px-20">
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full border-[65px] border-white/5" />

      <div className="relative z-10 max-w-lg">
        <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-blue-300"
            aria-hidden="true"
          >
            <path d="M12 2 20 6v6c0 5-3 8-8 10-5-2-8-5-8-10V6l8-4Z" />
            <path d="m9 12 2 2 4-4" />
          </svg>
        </div>

        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-blue-300">
          RentACar Platform
        </p>

        <h2 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
          Platform kontrolü,
          <span className="block text-blue-300">
            tek merkezde.
          </span>
        </h2>

        <p className="mt-6 max-w-md text-base leading-8 text-[#bbc9dd]">
          Şirket başvurularını, onay süreçlerini ve
          platform operasyonlarını güvenle yönetin.
        </p>

        <div className="mt-12 flex items-center gap-3 border-t border-white/10 pt-6 text-sm text-[#bbc9dd]">
          <span className="text-blue-300">✓</span>
          Yetkili platform yöneticisi erişimi
        </div>
      </div>
    </section>
  </main>
);

}
