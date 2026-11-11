import VehicleList from "@/components/vehicles/VehicleList";
import { mockVehicles } from "@/lib/vehicles/mock-data";

export default function VehicleDemoPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        <div
          role="note"
          className="flex items-start gap-4 rounded-2xl border border-amber-300 bg-amber-50 p-5 shadow-sm"
        >
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-200 text-amber-900">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
              className="h-6 w-6"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 7v6M12 17h.01" />
            </svg>
          </div>

          <div>
            <p className="text-sm font-bold text-amber-950">
              Demo Görünümü
            </p>

            <p className="mt-1 text-sm leading-relaxed text-amber-900">
              Bu sayfadaki araçlar örnek verilerle gösterilmektedir.
              Gerçek araç kayıtları, rezervasyon bilgileri veya
              anlık kiralama müsaitliği içermez.
            </p>
          </div>
        </div>

        <VehicleList vehicles={mockVehicles} />
      </div>
    </main>
  );
}
