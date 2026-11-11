
import VehicleList from "@/components/vehicles/VehicleList";
import { mockVehicles } from "@/lib/vehicles/mock-data";

export default function VehicleDemoPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-4">
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Demo ekranı — Burada gösterilen araçlar örnek verilerdir.
          Gerçek araç kayıtları veya kiralama durumları gösterilmez.
        </div>

        	<VehicleList vehicles={mockVehicles} />
      </div>
    </main>
  );
}
