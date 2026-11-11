import type {
  VehicleCategory,
  VehicleDisplayData,
  Transmission,
  FuelType,
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
    <article className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-lg">
      {/* Araç görseli / placeholder */}
      <div className="relative flex h-48 items-center justify-center bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200">
        <svg
          viewBox="0 0 320 160"
          aria-hidden="true"
          className="h-36 w-64 text-slate-400"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M40 102 L60 94 L90 56 Q105 42 126 42 H207 Q226 42 244 58 L268 92 L282 99 Q292 103 292 114 V126 H28 V114 Q28 106 40 102Z"
            fill="currentColor"
            opacity="0.18"
          />
          <path
            d="M40 102 L60 94 L90 56 Q105 42 126 42 H207 Q226 42 244 58 L268 92 L282 99 Q292 103 292 114 V126 H28 V114 Q28 106 40 102Z"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M100 59 H208 Q222 59 233 72 L247 91 H77 L92 69 Q95 64 100 59Z"
            fill="white"
            opacity="0.7"
          />
          <circle cx="89" cy="125" r="22" fill="#475569" />
          <circle cx="89" cy="125" r="10" fill="#CBD5E1" />
          <circle cx="234" cy="125" r="22" fill="#475569" />
          <circle cx="234" cy="125" r="10" fill="#CBD5E1" />
          <path
            d="M35 107 H56 M270 107 H288"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute right-4 top-4">
          <VehicleStatusBadge status={vehicle.fleetStatus} />
        </div>

        <span className="absolute bottom-4 left-4 rounded-lg border border-white/80 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
          {categoryLabels[vehicle.category]}
        </span>
      </div>

      <div className="p-5">
        <div>
          <p className="text-xs font-medium tracking-wide text-slate-500">
            {vehicle.modelYear} MODEL
          </p>

          <h3 className="mt-1 text-xl font-bold text-slate-900">
            {vehicle.make} {vehicle.model}
          </h3>

          <p className="mt-2 inline-flex rounded-md bg-slate-100 px-2.5 py-1 text-xs font-medium tracking-wide text-slate-600">
            {vehicle.plate}
          </p>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3 border-y border-slate-100 py-4">
          <div>
            <p className="text-xs text-slate-400">Vites</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              {transmissionLabels[vehicle.transmission]}
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">Yakıt</p>
            <p className="mt-1 text-sm font-semibold text-slate-700">
              {fuelLabels[vehicle.fuelType]}
            </p>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-500">Günlük kiralama</p>
            <p className="mt-1 text-xl font-bold text-slate-900">
              {price}
              <span className="ml-1 text-xs font-normal text-slate-400">
                / gün
              </span>
            </p>
          </div>

          {onSelect && (
            <button
              type="button"
              onClick={() => onSelect(vehicle.id)}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              Detay
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
