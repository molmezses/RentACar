
import type { VehicleDisplayData } from "@/types/vehicle";
import VehicleStatusBadge from "./VehicleStatusBadge";

type VehicleCardProps = {
  vehicle: VehicleDisplayData;
  onSelect?: (id: string) => void;
};

export default function VehicleCard({
  vehicle,
  onSelect,
}: VehicleCardProps) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="font-semibold text-slate-900">
            {vehicle.make} {vehicle.model}
          </h3>
          <p className="text-sm text-slate-500">
            {vehicle.modelYear} · {vehicle.plate}
          </p>
        </div>

        <VehicleStatusBadge status={vehicle.fleetStatus} />
      </div>

      <div className="mb-4 space-y-1 text-sm text-slate-600">
        <p>Kategori: {vehicle.category}</p>
        <p>Vites: {vehicle.transmission}</p>
        <p>Yakıt: {vehicle.fuelType}</p>
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-4">
        <div>
          <p className="text-xs text-slate-500">Günlük fiyat</p>
          <p className="font-semibold text-slate-900">
            {vehicle.dailyPrice} {vehicle.currency}
          </p>
        </div>

        {onSelect && (
          <button
            type="button"
            onClick={() => onSelect(vehicle.id)}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            Detay
          </button>
        )}
      </div>
    </article>
  );
}
