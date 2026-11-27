"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

import { fetchVehicleById, VehicleApiError } from "@/lib/vehicles/api";
import VehicleStatusBadge from "@/components/vehicles/VehicleStatusBadge";
import type { Vehicle } from "@/types/vehicle";

const categories: Record<Vehicle["category"], string> = {
  ECONOMY: "Ekonomi",
  COMPACT: "Kompakt",
  SEDAN: "Sedan",
  SUV: "SUV",
  LUXURY: "Lüks",
  VAN: "Van",
  OTHER: "Diğer",
};

const transmissions = {
  MANUAL: "Manuel",
  AUTOMATIC: "Otomatik",
};

const fuels: Record<Vehicle["fuelType"], string> = {
  PETROL: "Benzin",
  DIESEL: "Dizel",
  HYBRID: "Hibrit",
  ELECTRIC: "Elektrik",
  LPG: "LPG",
  OTHER: "Diğer",
};

function text(value: string | number | null | undefined) {
  return value === null || value === undefined || value === ""
    ? "Belirtilmemiş"
    : String(value);
}

function money(value: string | null, currency: Vehicle["currency"]) {
  if (value === null) return "Belirtilmemiş";

  const amount = Number(value);
  if (!Number.isFinite(amount)) return "Belirtilmemiş";

  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
  }).format(amount);
}

function numberKm(value: number | null) {
  return value === null
    ? "Belirtilmemiş"
    : `${value.toLocaleString("tr-TR")} km`;
}

function date(value: string | null) {
  if (!value) return "Belirtilmemiş";
  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime())
    ? "Belirtilmemiş"
    : parsed.toLocaleDateString("tr-TR");
}

function InfoRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-1 border-b border-slate-100 py-3 last:border-b-0 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
      <dt className="text-sm text-slate-500">{label}</dt>
      <dd className="min-w-0 break-words text-sm font-semibold text-[#13241f] sm:text-right">
        {text(value)}
      </dd>
    </div>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-200/60">
      <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
        <h2 className="text-base font-bold text-[#13241f]">{title}</h2>
        {description && (
          <p className="mt-1 text-xs text-slate-500">{description}</p>
        )}
      </div>
      <div className="px-5 py-2 sm:px-6">{children}</div>
    </section>
  );
}

function VehicleOverview({ vehicle }: { vehicle: Vehicle }) {
  return (
    <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <p className="mb-2 text-xs font-medium text-slate-500">
          Araç Filosu / Araç Detayı
        </p>
        <h1 className="break-words text-2xl font-bold tracking-tight text-[#13241f] sm:text-3xl">
          {vehicle.make} {vehicle.model}
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          {vehicle.modelYear} · {categories[vehicle.category]} · {vehicle.plate}
        </p>
      </div>

      <div className="self-start">
        <VehicleStatusBadge status={vehicle.fleetStatus} />
      </div>
    </header>
  );
}

function VehicleIllustration({ view }: { view: number }) {
  return (
    <svg
      viewBox="0 0 400 210"
      className="h-full max-h-72 w-full"
      role="img"
      aria-label="Temsili araç çizimi"
    >
      <ellipse
        cx="200"
        cy="174"
        rx="145"
        ry="11"
        fill="#64748b"
        opacity=".12"
      />

      {view === 1 ? (
        // Önden görünüm
        <g>
          <path
            d="M95 118 121 70 Q132 48 160 48 H240 Q268 48 279 70 L305 118 316 146 V162 H84 V146Z"
            fill="#cbd5e1"
            stroke="#64748b"
            strokeWidth="3"
          />
          <path
            d="M137 76 Q145 65 163 65 H237 Q255 65 263 76 L281 112 H119Z"
            fill="#e2f3f8"
            stroke="#94a3b8"
            strokeWidth="2"
          />
          <path d="M100 125 H300 L285 145 H115Z" fill="#64748b" />
          <path
            d="M109 124 H148 L141 135 H105ZM252 124 H291 L295 135 H259Z"
            fill="#f8fafc"
          />
          <rect x="166" y="147" width="68" height="10" rx="3" fill="#94a3b8" />
          <path
            d="M102 158 V175 M298 158 V175"
            stroke="#334155"
            strokeWidth="14"
          />
        </g>
      ) : view === 2 ? (
        // Arkadan görünüm
        <g>
          <path
            d="M100 119 124 72 Q135 52 162 52 H238 Q265 52 276 72 L300 119 310 146 V163 H90 V146Z"
            fill="#cbd5e1"
            stroke="#64748b"
            strokeWidth="3"
          />
          <path
            d="M138 78 Q148 67 164 67 H236 Q252 67 262 78 L278 116 H122Z"
            fill="#dbeafe"
            stroke="#94a3b8"
            strokeWidth="2"
          />
          <path
            d="M102 123 H151 L145 137 H99ZM249 123 H298 L301 137 H255Z"
            fill="#ef8686"
          />
          <rect
            x="162"
            y="140"
            width="76"
            height="17"
            rx="4"
            fill="#f8fafc"
            stroke="#94a3b8"
          />
          <path
            d="M105 160 V176 M295 160 V176"
            stroke="#334155"
            strokeWidth="14"
          />
        </g>
      ) : (
        // Yandan görünüm
        <g>
          <path
            d="M37 127 66 117 106 77 Q121 61 151 61 H249 Q275 61 292 83 L327 116 352 127 Q364 134 364 147 V159 H26 V144 Q26 133 37 127Z"
            fill="#cbd5e1"
            stroke="#64748b"
            strokeWidth="3"
          />
          <path
            d="M118 91 Q127 78 148 78 H246 Q263 78 279 94 L303 117 H86Z"
            fill="#e0f2fe"
            stroke="#94a3b8"
            strokeWidth="2"
          />
          <path
            d="M201 78 V117 M194 125 V150 M107 125 V150 M295 125 V150"
            stroke="#94a3b8"
            strokeWidth="2"
          />
          <path
            d="M31 136 H65 M332 136 H359"
            stroke="#f8fafc"
            strokeWidth="7"
            strokeLinecap="round"
          />
          <circle cx="105" cy="158" r="25" fill="#334155" />
          <circle cx="105" cy="158" r="12" fill="#cbd5e1" />
          <circle cx="296" cy="158" r="25" fill="#334155" />
          <circle cx="296" cy="158" r="12" fill="#cbd5e1" />
        </g>
      )}
    </svg>
  );
}

function VehicleGalleryPlaceholder() {
  const [activeImage, setActiveImage] = useState(0);
  const views = [0, 1, 2] as const;

  function changeImage(direction: number) {
    setActiveImage(
      (previous) => (previous + direction + views.length) % views.length,
    );
  }

  return (
    <section
      aria-label="Araç görselleri"
      className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white p-3 shadow-md shadow-slate-200/60 sm:p-5"
    >
      {/* Galerinin odak noktası: tek büyük araç çizimi. */}
      <div className="relative flex min-h-56 items-center justify-center overflow-hidden rounded-xl bg-[#f2f5f3] px-12 py-5 sm:min-h-80 sm:px-16">
        <VehicleIllustration view={activeImage} />

        <span className="absolute left-3 top-3 rounded-md border border-slate-200/80 bg-white/90 px-2.5 py-1 text-[11px] font-medium text-slate-500">
          Temsili görsel
        </span>

        <button
          type="button"
          aria-label="Önceki görsel"
          onClick={() => changeImage(-1)}
          className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-xl text-[#13241f] shadow-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17674c] sm:left-4"
        >
          <span aria-hidden="true">‹</span>
        </button>
        <button
          type="button"
          aria-label="Sonraki görsel"
          onClick={() => changeImage(1)}
          className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white/95 text-xl text-[#13241f] shadow-sm transition hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17674c] sm:right-4"
        >
          <span aria-hidden="true">›</span>
        </button>
      </div>

      {/* Görünüm isimleri ekranda yer kaplamaz; küçük resimler seçilebilir. */}
      <div
        className="mt-3 grid grid-cols-3 gap-2 sm:gap-3"
        role="group"
        aria-label="Görsel önizlemeleri"
      >
        {views.map((view, index) => (
          <button
            key={view}
            type="button"
            onClick={() => setActiveImage(index)}
            aria-label={`${index + 1}. görseli göster`}
            aria-pressed={activeImage === index}
            className={`min-w-0 overflow-hidden rounded-lg border-2 p-1 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17674c] sm:p-2 ${
              activeImage === index
                ? "border-[#17674c] bg-[#eef5ef]"
                : "border-slate-200 bg-[#f8faf9] hover:border-slate-400"
            }`}
          >
            <div className="flex h-16 items-center justify-center sm:h-24">
              <VehicleIllustration view={view} />
            </div>
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-slate-400">
        Fotoğraf yükleme özelliği eklendiğinde bu önizlemeler gerçek araç
        fotoğraflarıyla değiştirilecek.
      </p>
    </section>
  );
}

function VehicleDetail({ vehicle }: { vehicle: Vehicle }) {
  return (
    <div className="space-y-6">
      <VehicleOverview vehicle={vehicle} />
      <VehicleGalleryPlaceholder />

      <div className="grid min-w-0 grid-cols-1 items-start gap-6 xl:grid-cols-3">
        <div className="min-w-0 space-y-6 xl:col-span-2">
          <Section
            title="Araç Bilgileri"
            description="Kimlik ve sınıflandırma bilgileri"
          >
            <dl>
              <InfoRow label="Plaka" value={vehicle.plate} />
              <InfoRow label="Marka" value={vehicle.make} />
              <InfoRow label="Model" value={vehicle.model} />
              <InfoRow label="Model yılı" value={vehicle.modelYear} />
              <InfoRow label="Kategori" value={categories[vehicle.category]} />
              <InfoRow label="Versiyon" value={vehicle.trim} />
              <InfoRow label="Renk" value={vehicle.color} />
              <InfoRow label="Şasi numarası" value={vehicle.vin} />
              <InfoRow label="İç araç kodu" value={vehicle.internalCode} />
            </dl>
          </Section>

          <Section
            title="Teknik Özellikler"
            description="Donanım ve kullanım bilgileri"
          >
            <dl>
              <InfoRow
                label="Vites tipi"
                value={transmissions[vehicle.transmission]}
              />
              <InfoRow label="Yakıt tipi" value={fuels[vehicle.fuelType]} />
              <InfoRow label="Koltuk sayısı" value={vehicle.seatCount} />
              <InfoRow label="Kapı sayısı" value={vehicle.doorCount} />
              <InfoRow label="Kilometre" value={numberKm(vehicle.odometerKm)} />
              <InfoRow
                label="Klima"
                value={
                  vehicle.hasAirConditioning === null
                    ? null
                    : vehicle.hasAirConditioning
                      ? "Var"
                      : "Yok"
                }
              />
            </dl>
          </Section>
        </div>

        <aside className="min-w-0 space-y-6">
          <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-md shadow-slate-200/60">
            <div className="border-b border-slate-100 px-5 py-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Günlük Kiralama Bedeli
              </p>
              <p className="mt-2 break-words text-2xl font-bold tracking-tight text-[#17674c] sm:text-3xl">
                {money(vehicle.dailyPrice, vehicle.currency)}
              </p>
              <p className="mt-1 text-xs text-slate-500">Günlük baz fiyat</p>
            </div>
            <dl className="px-5 py-2">
              <InfoRow
                label="Depozito"
                value={money(vehicle.depositAmount, vehicle.currency)}
              />
              <InfoRow
                label="Dahil kilometre"
                value={numberKm(vehicle.includedMileageKm)}
              />
              <InfoRow
                label="Ek kilometre ücreti"
                value={money(vehicle.extraKmPrice, vehicle.currency)}
              />
            </dl>
          </section>

          <Section title="Operasyon Bilgileri" description="Güncel filo kaydı">
            <dl>
              <InfoRow
                label="Filo durumu"
                value={vehicle.fleetStatus === "ACTIVE" ? "Aktif" : "Pasif"}
              />
              <InfoRow
                label="Mevcut konum"
                value={vehicle.currentLocationLabel}
              />
              <InfoRow label="Kayıt tarihi" value={date(vehicle.createdAt)} />
              <InfoRow label="Son güncelleme" value={date(vehicle.updatedAt)} />
              {vehicle.deactivatedAt && (
                <InfoRow
                  label="Pasife alınma tarihi"
                  value={date(vehicle.deactivatedAt)}
                />
              )}
            </dl>
          </Section>

          <Section title="İç Notlar">
            <p className="whitespace-pre-wrap break-words py-3 text-sm leading-6 text-slate-700">
              {text(vehicle.notes)}
            </p>
          </Section>

          <p className="px-1 text-xs leading-5 text-slate-500">
            Aktif filo durumu, aracın belirli tarihlerde kiralamaya müsait
            olduğunu garanti etmez.
          </p>
        </aside>
      </div>
    </div>
  );
}

export default function TenantVehicleDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function loadVehicle() {
      setIsLoading(true);
      setVehicle(null);
      setError(null);
      setErrorStatus(null);

      try {
        const result = await fetchVehicleById(id, controller.signal);
        if (!controller.signal.aborted) setVehicle(result);
      } catch (err) {
        if (controller.signal.aborted) return;

        if (err instanceof VehicleApiError) {
          setError(err.message);
          setErrorStatus(err.status);
        } else {
          setError("Beklenmeyen bir hata oluştu.");
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }

    void loadVehicle();
    return () => controller.abort();
  }, [id, retryCount]);

  return (
    <main className="mx-auto w-full min-w-0 max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <nav aria-label="Sayfa yolu">
        <Link
          href="/tenant/vehicles"
          className="inline-flex items-center gap-2 text-sm font-medium text-[#17674c] hover:underline"
        >
          <span aria-hidden="true">←</span>
          Araç listesine dön
        </Link>
      </nav>

      {isLoading ? (
        <div role="status" className="space-y-5">
          <div className="h-44 animate-pulse rounded-2xl bg-slate-200" />
          <div className="h-52 animate-pulse rounded-2xl bg-slate-200" />
          <span className="sr-only">Araç detayları yükleniyor...</span>
        </div>
      ) : error ? (
        <section
          role={errorStatus === 404 ? "status" : "alert"}
          className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8"
        >
          <h1 className="text-xl font-bold text-[#13241f]">
            {errorStatus === 404
              ? "Araç bulunamadı"
              : errorStatus === 401
                ? "Oturum gerekli"
                : errorStatus === 403
                  ? "Erişim izni yok"
                  : "Araç detayları yüklenemedi"}
          </h1>

          <p className="mt-2 text-sm text-slate-600">{error}</p>

          <div className="mt-6 flex flex-wrap gap-3">
            {errorStatus === 401 ? (
              <Link
                href="/tenant/login"
                className="rounded-lg bg-[#13241f] px-4 py-2 text-sm font-semibold text-white"
              >
                Giriş yap
              </Link>
            ) : errorStatus !== 403 && errorStatus !== 404 ? (
              <button
                type="button"
                onClick={() => setRetryCount((count) => count + 1)}
                className="rounded-lg bg-[#13241f] px-4 py-2 text-sm font-semibold text-white"
              >
                Tekrar dene
              </button>
            ) : null}

            <Link
              href="/tenant/vehicles"
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700"
            >
              Araç listesi
            </Link>
          </div>
        </section>
      ) : vehicle ? (
        <VehicleDetail vehicle={vehicle} />
      ) : null}
    </main>
  );
}
