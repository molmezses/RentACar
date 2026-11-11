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
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-4 sm:px-6">
        <h2 className="text-lg font-bold text-slate-900">
          {title}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
        {children}
      </div>
    </section>
  );
}
