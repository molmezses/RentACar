//Araç formunun bölümlerini oluşturan ortak bir react bileşeni/ ortak card yapısı
//Form bölümlerinin görsel iskeleti
import type { ReactNode } from "react";

type VehicleSectionId =
  | "identity"
  | "technical"
  | "operations"
  | "pricing";

type VehicleFormSectionProps = {
  id: VehicleSectionId;
  title: string;
  description: string;
  children: ReactNode;
};

function SectionIcon({ id }: { id: VehicleSectionId }) {
  const paths: Record<VehicleSectionId, ReactNode> = {
    identity: (
      <>
        <path d="M5 17h14l-1.5-7h-11L5 17Z" />
        <path d="m7 10 1-3h8l1 3M5 17v2m14-2v2M8 14h.01M16 14h.01" />
      </>
    ),
    technical: (
      <>
        <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1M18.4 5.6l-2.1 2.1m-8.6 8.6-2.1 2.1" />
        <circle cx="12" cy="12" r="4" />
      </>
    ),
    operations: (
      <>
        <path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" />
        <circle cx="12" cy="10" r="2.5" />
      </>
    ),
    pricing: (
      <>
        <rect x="3" y="6" width="18" height="14" rx="2" />
        <path d="M3 10h18M7 6V4h12M16 15h2" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      width="20"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-[#17674c]"
    >
      {paths[id]}
    </svg>
  );
}

export default function VehicleFormSection({
  id,
  title,
  description,
  children,
}: VehicleFormSectionProps) {
  return (
    <section className="min-w-0 rounded-xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-[#edf3f0] px-4 py-3">
        <SectionIcon id={id} />

        <h2 className="text-sm font-semibold text-[#18352a] sm:text-base">
          {title}
        </h2>

        <p className="text-xs text-slate-500 sm:text-sm">
          {description}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-4 px-2 pb-2 pt-4 sm:grid-cols-2 sm:px-3">
        {children}
      </div>
    </section>
  );
}
