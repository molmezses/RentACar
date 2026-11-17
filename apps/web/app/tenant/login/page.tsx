"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function TenantLoginPage() {

  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);



  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading || isSuccess) return;

    setIsLoading(true);
    setError("");

    const formData = new FormData(event.currentTarget);

    const email = String(formData.get("email") ?? "").trim();

    const password = String(formData.get("password") ?? "");

    try {
      // Next.js API route'una gönder.
      const response = await fetch("/api/tenant/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 401) {
          setError("E-posta veya şifre hatalı ya da hesabınız aktif değil.");
        } else {
          setError("Giriş yapılamadı. Lütfen tekrar deneyin.");
        }

        return;
      }

      setIsSuccess(true);
      router.replace("/tenant");
      router.refresh();
    } catch {
      setError("Sunucuya bağlanılamadı.");
    } finally {
      setIsLoading(false);
    }
  }


return (
  <main className="grid min-h-screen bg-[#f8faf9] lg:grid-cols-2">
    {/* SOL: GİRİŞ FORMU */}
    <section className="flex min-h-screen items-center justify-center px-6 py-12 sm:px-10">
      <div className="w-full max-w-md">
        <div className="mb-12 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-700 text-xl font-bold text-white">
            R
          </div>
          <div>
            <p className="text-lg font-bold tracking-tight text-[#172e26]">
              RentACar
            </p>
            <p className="text-xs text-slate-500">
              İşletme Yönetimi
            </p>
          </div>
        </div>

        <div className="mb-9">
          <h1 className="text-3xl font-bold tracking-tight text-[#172e26]">
            Hoş geldiniz
          </h1>
          <p className="mt-3 text-sm text-slate-500">
            Şirket yönetim panelinize giriş yapın.
          </p>
        </div>

        {isSuccess ? (
          <div
            role="status"
            className="rounded-xl border border-emerald-100 bg-emerald-50 p-5 text-sm text-emerald-800"
          >
            Giriş başarılı. Şirket paneline yönlendiriliyorsunuz...
          </div>
        ) : (
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
                placeholder="yonetici@sirket.com"
                required
                disabled={isLoading}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
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
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/10"
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
              className="w-full rounded-xl bg-emerald-700 px-4 py-3.5 font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </button>

            <p className="text-center text-xs text-slate-400">
              Yalnızca yetkili şirket yöneticileri içindir.
            </p>
          </form>
        )}
      </div>
    </section>

    {/* SAĞ: TANITIM ALANI */}
    <section className="relative hidden overflow-hidden bg-[#13241f] px-14 lg:flex lg:items-center xl:px-20">
      <div className="pointer-events-none absolute -bottom-32 -right-32 h-96 w-96 rounded-full border-[65px] border-white/5" />

      <div className="relative z-10 max-w-lg">
        <div className="mb-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-3xl">
          🚗
        </div>

        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-300">
          RentACar Business
        </p>

        <h2 className="text-4xl font-bold leading-tight tracking-tight text-white xl:text-5xl">
          İşletmeniz,
          <span className="block text-emerald-300">
            tek panelde.
          </span>
        </h2>

        <p className="mt-6 max-w-md text-base leading-8 text-[#b7c9c1]">
          Araçlarınızı, rezervasyonlarınızı ve
          müşterilerinizi tek bir yerden yönetin.
        </p>

        <div className="mt-12 flex items-center gap-3 border-t border-white/10 pt-6 text-sm text-[#b7c9c1]">
          <span className="text-emerald-300">✓</span>
          Güvenli şirket yönetimi
        </div>
      </div>
    </section>
  </main>
);

}
