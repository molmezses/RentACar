//Araç listesinde ve detay ekranında Aktif/Pasif durumunu gösterme


import type { FleetStatus } from "@/types/vehicle";

type VehicleStatusBadgeProps = {
  status: FleetStatus;
};

export default function VehicleStatusBadge({
  status,
}: VehicleStatusBadgeProps) {
  const isActive = status === "ACTIVE";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold shadow-sm ${
        isActive
          ? "border-emerald-200 bg-emerald-100 text-emerald-800"
          : "border-rose-200 bg-rose-100 text-rose-800"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-2 w-2 rounded-full ${
          isActive ? "bg-emerald-600" : "bg-rose-600"
        }`}
      />

      {isActive ? "Aktif" : "Pasif"}
    </span>
  );
}
