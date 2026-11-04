import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LogoutButton from "./logout-button";

type AdminProfile = {
  id: string;
  email: string;
};

async function ProtectedAdminContent() {
  // Tarayıcıdan gelen oturum çerezini oku.
  const cookieStore = await cookies();

  const token = cookieStore.get(
    "rentacar_admin_session",
  )?.value;

  // Oturum çerezi yoksa giriş sayfasına yönlendir.
  if (!token) {
    redirect("/admin/login");
  }

  const apiUrl =
    process.env.API_INTERNAL_URL ??
    "http://localhost:3001";

  let response: Response;

  try {
    // NestJS'e JWT'yi doğrulat.
    response = await fetch(`${apiUrl}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
  } catch {
    // API'ye ulaşılamıyorsa kullanıcıya
    // oturum hatası yerine servis hatası göster.
    return (
      <main className="p-8">
        <p role="alert" className="text-red-700">
          Yönetim servisine şu anda ulaşılamıyor.
        </p>
      </main>
    );
  }

  if (response.status === 401) {
    redirect("/admin/login");
  }

  if (!response.ok) {
    return (
      <main className="p-8">
        <p role="alert" className="text-red-700">
          Yönetici bilgileri alınamadı.
        </p>
      </main>
    );
  }

  
  // Gelen JSON verisinin yapısını henüz bilmiyoruz.
  const data: unknown = await response.json().catch(() => null);

  // Beklediğimiz AdminProfile yapısını kontrol et.
  if (
    typeof data !== "object" ||
    data === null ||
    !("id" in data) ||
    !("email" in data) ||
    typeof data.id !== "string" ||
    typeof data.email !== "string" ||
    data.id.length === 0 ||
    data.email.length === 0
  ) {
    return (
      <main className="p-8">
        <p role="alert" className="text-red-700">
          Yönetici bilgileri geçersiz biçimde alındı.
        </p>
      </main>
    );
  }

  const admin: AdminProfile = {
    id: data.id,
    email: data.email,
  };


  return (
    <main className="min-h-screen bg-slate-100 p-8">
      <div className="mx-auto max-w-4xl rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-sm font-medium text-slate-500">
          RentACar
        </p>

        <h1 className="mt-2 text-3xl font-bold text-slate-900">
          Super Admin Paneli
        </h1>

        <p className="mt-4 text-slate-600">
          Giriş başarılı. Hoş geldiniz!
        </p>

        <p className="mt-2 text-sm text-slate-500">
          Yönetici: {admin.email}
        </p>

        <LogoutButton />
      </div>
    </main>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="p-8">Oturum doğrulanıyor...</p>}>
      <ProtectedAdminContent />
    </Suspense>
  );
}
