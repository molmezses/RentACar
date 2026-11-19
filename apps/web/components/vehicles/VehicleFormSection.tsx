//Araç formunun bölümlerini oluşturan ortak bir react bileşeni/ ortak card yapısı
//Form bölümlerinin görsel iskeleti
import type { ReactNode } from "react";

type VehicleFormSectionProps = {
  title: string;
  description: string;
  children: ReactNode;
};

export default function VehicleFormSection({
  title,
  description,
  children,
}: VehicleFormSectionProps) {
  return (
    <section className="min-w-0 overflow-hidden rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-[#e5ece8] bg-[#f8faf8] px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          <span
            aria-hidden="true"
            className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#17674c]"
          />

          <div className="min-w-0">
            <h2 className="text-base font-semibold text-[#18352a] sm:text-lg">
              {title}
            </h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              {description}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-x-6 gap-y-5 p-5 sm:grid-cols-2 sm:p-6">
        {children}
      </div>
    </section>
  );
}
