import type {
  FuelType,
  Transmission,
  VehicleDisplayData,
} from "@/types/vehicle";

type VehicleCardProps = {
  vehicle: VehicleDisplayData;
  onSelect?: (id: string) => void;
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
      className="h-12 w-20"
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
  <article className="border-b border-slate-200 bg-white px-4 py-5 last:border-b-0 sm:px-5 sm:py-6">
    <div className="flex min-w-0 items-start gap-3 sm:gap-4">
      {/* Küçük araç görseli */}
      <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-lg bg-[#edf3ef]">
        <CarPlaceholder />
      </div>

      {/* Araç bilgileri */}
      <div className="min-w-0 flex-1 space-y-1">
        <h3 className="text-sm font-semibold text-[#18352a] sm:text-base">
          {vehicle.make} {vehicle.model}
        </h3>

        <p className="text-sm text-slate-500">
          {vehicle.plate}
        </p>

        <p className="text-xs text-slate-400">
          {vehicle.modelYear} ·{" "}
          {transmissionLabels[vehicle.transmission]} ·{" "}
          {fuelLabels[vehicle.fuelType]}
        </p>
      </div>

      {/* Fiyat, durum ve detay */}
      <div className="flex shrink-0 flex-col items-end gap-2 text-right">
        <p className="text-sm font-semibold text-[#18352a] sm:text-base">
          {price}
        </p>

        <span
          className={`rounded-full px-2.5 py-1 text-xs font-medium ${
            vehicle.fleetStatus === "ACTIVE"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-red-50 text-red-600"
          }`}
        >
          {vehicle.fleetStatus === "ACTIVE" ? "Aktif" : "Pasif"}
        </span>

        {onSelect && (
          <button
            type="button"
            onClick={() => onSelect(vehicle.id)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#17674c] hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 sm:text-sm"
          >
            Araç Detayı
            <span aria-hidden="true">›</span>
          </button>
        )}
      </div>
    </div>
  </article>
);
}
