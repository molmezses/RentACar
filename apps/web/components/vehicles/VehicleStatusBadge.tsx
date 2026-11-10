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
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
        isActive
          ? "bg-green-100 text-green-800"
          : "bg-slate-100 text-slate-600"
      }`}
    >
      {isActive ? "Aktif" : "Pasif"}
    </span>
  );
}
