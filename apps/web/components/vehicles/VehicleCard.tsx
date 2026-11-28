import type {
  FuelType,
  Transmission,
  VehicleDisplayData,
} from "@/types/vehicle";

type VehicleCardProps = {
  vehicle: VehicleDisplayData;
  onSelect?: (id: string) => void;
  onEdit?: (id: string) => void;
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

      <path d="M159 59 V92" stroke="#94A3B8" strokeWidth="3" />

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

export default function VehicleCard({ vehicle, onSelect,onEdit,
}: VehicleCardProps) {
  const price = new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: vehicle.currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Number(vehicle.dailyPrice));

  // Kartın görünümünü tek bir yerde tanımlıyoruz.
  const cardContent = (
    <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
      {/* Araç görseli ve kimlik bilgileri */}
      <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center sm:gap-4">
        <div className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#edf3ef]">
          <CarPlaceholder />
        </div>

        <div className="min-w-0 space-y-1">
          <h3 className="break-words text-sm font-semibold text-[#18352a] sm:text-base">
            {vehicle.make} {vehicle.model}
          </h3>

          <p className="break-words text-sm text-slate-600">{vehicle.plate}</p>

          <p className="text-xs leading-relaxed text-slate-500">
            {vehicle.modelYear} · {transmissionLabels[vehicle.transmission]} ·{" "}
            {fuelLabels[vehicle.fuelType]}
          </p>
        </div>
      </div>

      {/* Fiyat ve filo durumu */}
      <div className="flex min-w-0 items-center justify-between gap-3 pl-[84px] sm:flex-col sm:items-end sm:justify-center sm:gap-2 sm:pl-0">
        <div className="text-right">
          <p className="text-sm font-bold text-[#18352a] sm:text-base">
            {price}
          </p>
          <p className="text-xs text-slate-500">Günlük</p>
        </div>

        <span
          className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-1 text-xs font-medium ${
            vehicle.fleetStatus === "ACTIVE"
              ? "bg-emerald-50 text-emerald-700"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {vehicle.fleetStatus === "ACTIVE" ? "Aktif" : "Pasif"}
        </span>
      </div>

      {/* Kartın açılabilir olduğunu gösteren sade ok */}
      {onSelect && (
        <span
          aria-hidden="true"
          className="hidden shrink-0 text-xl text-slate-400 transition-colors group-hover:text-[#17674c] sm:block"
        >
          ›
        </span>
      )}
    </div>
  );

  return (
    <article className="border-b border-slate-200 bg-white last:border-b-0">
      {onSelect ? (
        <button
          type="button"
          onClick={() => onSelect(vehicle.id)}
          aria-label={`${vehicle.make} ${vehicle.model}, ${vehicle.plate} aracının detaylarını görüntüle`}
          className="group block w-full cursor-pointer px-4 py-5 text-left transition-colors duration-150 hover:bg-[#f4f8f5] focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#17674c] sm:px-5 sm:py-6"
        >
          {cardContent}
        </button>
      ) : (
        <div className="px-4 py-5 sm:px-5 sm:py-6">{cardContent}</div>
      )}

        {onEdit && (
          <button
            type="button"
            onClick={() => onEdit(vehicle.id)}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-[#17674c] hover:underline focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 sm:text-sm"
          >
            Düzenle
            <span aria-hidden="true">›</span>
          </button>
        )}
    </article>
  );
}
