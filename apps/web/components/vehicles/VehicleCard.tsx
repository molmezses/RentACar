import type {
  FuelType,
  Transmission,
  VehicleCategory,
  VehicleDisplayData,
} from "@/types/vehicle";

import VehicleStatusBadge from "./VehicleStatusBadge";

type VehicleCardProps = {
  vehicle: VehicleDisplayData;
  onSelect?: (id: string) => void;
};

const categoryLabels: Record<VehicleCategory, string> = {
  ECONOMY: "Ekonomi",
  COMPACT: "Kompakt",
  SEDAN: "Sedan",
  SUV: "SUV",
  LUXURY: "Lüks",
  VAN: "Van",
  OTHER: "Diğer",
};

const transmissionLabels: Record<Transmission, string> = {
  MANUAL: "Manuel",
  AUTOMATIC: "Otomatik",
};

const fuelLabels: Record<FuelType, string> = {
  PETROL: "Benzin",
  DIESEL: "Dizel",
  HYBRID: "Hibrit",
  ELECTRIC: "Elektrik",
  LPG: "LPG",
  OTHER: "Diğer",
};

function CarPlaceholder() {
  return (
    <svg
      viewBox="0 0 320 160"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="h-32 w-60 drop-shadow-lg"
    >
      <ellipse
        cx="160"
        cy="139"
        rx="126"
        ry="10"
        fill="#94A3B8"
        opacity=".18"
      />

      <path
        d="M38 101 L61 93 L91 56 Q105 42 128 42 H205 Q228 42 244 59 L267 92 L283 100 Q293 104 293 115 V125 H27 V114 Q27 105 38 101Z"
        fill="#CBD5E1"
        stroke="#64748B"
        strokeWidth="3"
        strokeLinejoin="round"
      />

      <path
        d="M103 59 H205 Q221 59 234 74 L247 92 H76 L92 70 Q97 63 103 59Z"
        fill="#EFF6FF"
      />

      <path
        d="M159 59 V92"
        stroke="#94A3B8"
        strokeWidth="3"
      />

      <path
        d="M35 108 H56 M270 108 H286"
        stroke="#F8FAFC"
        strokeWidth="6"
        strokeLinecap="round"
      />

      <circle cx="88" cy="125" r="21" fill="#334155" />
      <circle cx="88" cy="125" r="10" fill="#CBD5E1" />

      <circle cx="234" cy="125" r="21" fill="#334155" />
      <circle cx="234" cy="125" r="10" fill="#CBD5E1" />
    </svg>
  );
}

export default function VehicleCard({
  vehicle,
  onSelect,
}: VehicleCardProps) {
  const price = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: vehicle.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(vehicle.dailyPrice));

  return (
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-xl">
      {/* Görsel alanı */}
      <div className="relative flex h-40 items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-slate-50 to-blue-100">
        <div className="absolute -right-12 -top-16 h-48 w-48 rounded-full bg-white/40 blur-2xl" />

        <div className="relative transition-transform duration-300 group-hover:scale-105">
          <CarPlaceholder />
        </div>

        <div className="absolute right-4 top-4">
          <VehicleStatusBadge status={vehicle.fleetStatus} />
        </div>

        <span className="absolute bottom-3 left-4 rounded-lg border border-white bg-white/95 px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm">
          {categoryLabels[vehicle.category]}
        </span>
      </div>

      {/* Araç bilgileri */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              {vehicle.modelYear} Model
            </p>

            <h3 className="mt-1 text-xl font-bold tracking-tight text-slate-900">
              {vehicle.make} {vehicle.model}
            </h3>
          </div>

          <span className="shrink-0 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-bold text-slate-700">
            {vehicle.plate}
          </span>
        </div>

        {/* Teknik özellikler */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 px-3 py-3">
            <div className="mb-2 flex items-center gap-2 text-slate-500">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
                className="h-4 w-4"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M12 2v7m0 6v7M2 12h7m6 0h7" />
              </svg>

              <span className="text-xs">Vites</span>
            </div>

            <p className="text-sm font-bold text-slate-800">
              {transmissionLabels[vehicle.transmission]}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 px-3 py-3">
            <div className="mb-2 flex items-center gap-2 text-slate-500">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.7"
                aria-hidden="true"
                className="h-4 w-4"
              >
                <path d="M5 21V5a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v16M3 21h14M5 10h10M15 7l4 4v7a2 2 0 0 0 4 0v-6l-4-4" />
              </svg>

              <span className="text-xs">Yakıt</span>
            </div>

            <p className="text-sm font-bold text-slate-800">
              {fuelLabels[vehicle.fuelType]}
            </p>
          </div>
        </div>

        {/* Fiyat ve aksiyon */}
        <div className="mt-5 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <div>
            <p className="text-xs font-medium text-slate-500">
              Günlük kiralama
            </p>

            <div className="mt-1 flex items-baseline gap-1">
              <span className="text-2xl font-extrabold tracking-tight text-slate-900">
                {price}
              </span>

              <span className="text-xs text-slate-400">
                / gün
              </span>
            </div>
          </div>

          {onSelect && (
            <button
              type="button"
              onClick={() => onSelect(vehicle.id)}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Detayları Gör
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
