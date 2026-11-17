"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";

export default function ActivatePage() {
  const tokenRef = useRef<string | null>(null);

  const [tokenStatus, setTokenStatus] = useState<
    "loading" | "valid" | "invalid"
  >("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  // 1. Aktivasyon token'ını URL'den yalnızca bir kez oku.

  useEffect(() => {
    const url = new URL(window.location.href);
    const urlToken = url.searchParams.get("token");

    // Token URL'de bulunuyorsa sakla.
    // React Strict Mode effect'i tekrar çalıştırdığında,
    // daha önce saklanan token'ı null ile ezme.
    if (urlToken !== null) {
      tokenRef.current = urlToken;
    }

    // Token'ı adres çubuğundan kaldır.
    if (url.searchParams.has("token")) {
      url.searchParams.delete("token");

      window.history.replaceState(
        window.history.state,
        "",
        url.pathname + url.search + url.hash,
      );
    }

    const isValidToken =
      tokenRef.current !== null && /^[A-Za-z0-9_-]{43}$/.test(tokenRef.current);

    const timeoutId = window.setTimeout(() => {
      setTokenStatus(isValidToken ? "valid" : "invalid");
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isLoading || isSuccess) return;

    setError("");

    const token = tokenRef.current;

    if (!token || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
      setError("Aktivasyon bağlantısı geçersiz.");
      return;
    }

    if (password.length < 12 || password.length > 128) {
      setError("Şifre 12 ile 128 karakter arasında olmalıdır.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Şifreler birbiriyle eşleşmiyor.");
      return;
    }

    setIsLoading(true);

    try {
      // 2. Tarayıcıdan kendi Next.js API route'umuza git.
      const response = await fetch("/api/tenant/activate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
        cache: "no-store",
      });

      if (!response.ok) {
        if (response.status === 400) {
          setError(
            "Aktivasyon bağlantısı geçersiz, kullanılmış veya süresi dolmuş olabilir.",
          );
        } else {
          setError(
            "Aktivasyon sırasında bir sorun oluştu. Lütfen tekrar deneyin.",
          );
        }

        return;
      }

      // 3. Başarılı aktivasyondan sonra token'ı bellekten kaldır.
      tokenRef.current = null;
      setPassword("");
      setConfirmPassword("");
      setIsSuccess(true);
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
            Şirket Yöneticisi Hesap Aktivasyonu
          </p>
        </div>

        {tokenStatus === "loading" ? (
          <p className="text-center text-sm text-slate-500">
            Aktivasyon bağlantısı kontrol ediliyor...
          </p>
        ) : isSuccess ? (
          <div className="space-y-5 text-center">
            <div
              role="status"
              className="rounded-xl bg-green-50 p-4 text-sm text-green-800"
            >
              Hesabınız başarıyla etkinleştirildi. Artık e-posta adresiniz ve
              şifrenizle giriş yapabilirsiniz.
            </div>

            <Link
              href="/tenant/login"
              className="block w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white transition hover:bg-slate-800"
            >
              Giriş Ekranına Git
            </Link>
          </div>
        ) : tokenStatus === "invalid" ? (
          <div className="space-y-5 text-center">
            <p role="alert" className="text-sm text-red-700">
              Aktivasyon bağlantısı bulunamadı veya geçersiz.
            </p>

            <p className="text-sm text-slate-500">
              Lütfen size gönderilen aktivasyon e-postasındaki bağlantıyı
              kullanın.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <p className="text-sm text-slate-600">
              Hesabınızı etkinleştirmek için yeni bir şifre belirleyin.
            </p>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Yeni Şifre
              </label>

              <input
                id="password"
                type="password"
                autoComplete="new-password"
                minLength={12}
                maxLength={128}
                required
                disabled={isLoading}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="En az 12 karakter"
                className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10"
              />
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-slate-700"
              >
                Şifre Tekrar
              </label>

              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                minLength={12}
                maxLength={128}
                required
                disabled={isLoading}
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Şifrenizi tekrar girin"
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
              {isLoading
                ? "Hesap etkinleştiriliyor..."
                : "Hesabımı Etkinleştir"}
            </button>

            <p className="text-center text-xs text-slate-400">
              Aktivasyon bağlantısı tek kullanımlıktır.
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
