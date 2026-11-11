//Yeni araç ekleme ekranı Kullanıcı yeni araç ekle sayfasını açar - VehicleForm bileşeni görüntülenir - Kullanıcı formu doldurup gönderir - form bilgileri doğrulanır
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import VehicleForm from "@/components/vehicles/VehicleForm";
import type { CreateVehicleInput } from "@/types/vehicle";

export default function VehicleCreateDemoPage() {
  const router = useRouter();
  const [submittedVehicle, setSubmittedVehicle] =
    useState<CreateVehicleInput | null>(null);

//Kullanıcı formu geçerli bilgilerle göderirse VehicleForm bu fonksiyonu çağırır
  function handleSubmit(vehicle: CreateVehicleInput) {
    setSubmittedVehicle(vehicle);
  }

//Kullanıcı iptal butonuna bastığında araç listeleem ekranına yönlendirilir
  function handleCancel() {
    router.push("/vehicle-demo");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-bold text-slate-900">
            Yeni Araç Ekle
          </h1>
          <p className="text-slate-600">
            Filonuza eklemek istediğiniz aracın bilgilerini girin.
          </p>
        </header>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Demo modu: Bu ekranda gerçek araç kaydı yapılmaz.
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
              Bu bir demo işlemidir; araç kaydedilmedi.
            </p>
          </div>
        )}

        <VehicleForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          submitLabel="Demo Olarak Kontrol Et"
        />
      </div>
    </main>
  );
}
