
import type { TenantApplicationStatus } from "../../../../types/tenant-application";

type ApplicationStatusBadgeProps = {
  status: TenantApplicationStatus;
};

const statusConfig = {
  PENDING: {
    label: "Bekliyor",
    className: "bg-amber-100 text-amber-800",
  },
  APPROVED: {
    label: "Onaylandı",
    className: "bg-green-100 text-green-800",
  },
  REJECTED: {
    label: "Reddedildi",
    className: "bg-red-100 text-red-800",
  },
};

export default function ApplicationStatusBadge({
  status,
}: ApplicationStatusBadgeProps) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${config.className}`}
    >
      {config.label}
    </span>
  );
}
