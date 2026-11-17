
type IconName =
  | "dashboard"
  | "car"
  | "calendar"
  | "users"
  | "settings";

type Props = {
  name: IconName;
};

export default function TenantNavIcon({ name }: Props) {
  const common = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-5 w-5 shrink-0"
      {...common}
    >
      {name === "dashboard" && (
        <>
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </>
      )}

      {name === "car" && (
        <>
          <path d="M5 17H3v-5l2-6h14l2 6v5h-2" />
          <path d="M5 17h14M3 12h18M7 17v2H5v-2M19 17v2h-2v-2" />
          <path d="M7 14h2M15 14h2" />
        </>
      )}

      {name === "calendar" && (
        <>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M7 3v4M17 3v4M3 10h18" />
          <path d="M8 14h3M8 17h3M15 14h2" />
        </>
      )}

      {name === "users" && (
        <>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 20v-2a6 6 0 0 1 12 0v2" />
          <path d="M16 5a3 3 0 0 1 0 6" />
          <path d="M18 14a5 5 0 0 1 3 5v1" />
        </>
      )}

      {name === "settings" && (
        <>
          <path d="M10 3h4l.6 2.2 2 1.1 2.2-.6 2 3.5-1.6 1.6v2.4l1.6 1.6-2 3.5-2.2-.6-2 1.1L14 21h-4l-.6-2.2-2-1.1-2.2.6-2-3.5 1.6-1.6v-2.4L3.2 9.2l2-3.5 2.2.6 2-1.1L10 3Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      )}
    </svg>
  );
}
