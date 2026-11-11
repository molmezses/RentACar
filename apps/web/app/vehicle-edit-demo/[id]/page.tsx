//Mevcut aracı bulup bilgilerini forma dolduruyoe
"use client";

import { Suspense, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import VehicleForm from "@/components/vehicles/VehicleForm";
import { mockVehicles } from "@/lib/vehicles/mock-data";
import { vehicleToFormValues } from "@/lib/vehicles/form-utils";
import type { CreateVehicleInput } from "@/types/vehicle";


function VehicleEditDemoContent() {
  const router = useRouter();
  const params = useParams<{ id: string }>();

  const vehicle = mockVehicles.find((item) => item.id === params.id);

  const [submittedVehicle, setSubmittedVehicle] =
    useState<CreateVehicleInput | null>(null);

  function handleSubmit(values: CreateVehicleInput) {
    setSubmittedVehicle(values);
  }

  function handleCancel() {
    router.push("/vehicle-demo");
  }

  if (!vehicle) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-12">
        <div className="mx-auto max-w-3xl rounded-xl border border-slate-200 bg-white p-8">
          <h1 className="text-2xl font-bold text-slate-900">
            Araç bulunamadı
          </h1>

          <p className="mt-2 text-slate-600">
            Düzenlemek istediğiniz araç demo verilerinde bulunmuyor.
          </p>

          <button
            type="button"
            onClick={handleCancel}
            className="mt-5 rounded-lg bg-slate-900 px-5 py-3 text-sm font-medium text-white"
          >
            Araç Listesine Dön
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">
            Araç Düzenle
          </h1>

          <p className="text-slate-600">
            {vehicle.make} {vehicle.model} — {vehicle.plate}
          </p>
        </header>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Demo modu: Değişiklikler veritabanına kaydedilmez.
        </div>

        {submittedVehicle && (
          <div
            role="status"
            className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900"
          >
            <strong>Form doğrulaması başarılı!</strong>

            <p className="mt-1">
              {submittedVehicle.make} {submittedVehicle.model} (
              {submittedVehicle.plate}) bilgileri doğrulandı.
              Değişiklikler yalnızca demo olarak kontrol edildi.
            </p>
          </div>
        )}
        <VehicleForm
          key={vehicle.id}
          initialValues={vehicleToFormValues(vehicle)}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Değişiklikleri Kontrol Et"
        />
      </div>
    </main>
  );
}

export default function VehicleEditDemoPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-slate-50 px-4 py-10">
          <div className="mx-auto max-w-5xl text-slate-600">
            Araç bilgileri yükleniyor...
          </div>
        </main>
      }
    >
      <VehicleEditDemoContent />
    </Suspense>
  );
}