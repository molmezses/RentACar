"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import VehicleForm from "@/components/vehicles/VehicleForm";
import type { CreateVehicleInput } from "@/types/vehicle";

export default function TenantVehicleCreatePage() {
  const router = useRouter();

  const [submittedVehicle, setSubmittedVehicle] =
    useState<CreateVehicleInput | null>(null);

  function handleSubmit(vehicle: CreateVehicleInput) {
    setSubmittedVehicle(vehicle);
  }

  function handleCancel() {
    router.push("/tenant/vehicles");
  }

  return (
    <div className="w-full min-w-0 px-5 py-6 md:px-8 xl:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#172e26]">
            Yeni Araç Ekle
          </h1>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <p>Filonuza eklemek istediğiniz aracın bilgilerini girin.
              <span
                className="font-semibold text-rose-600"
                aria-hidden="true"> *
              </span>{" "}  işaretli alanların doldurulması zorunludur. Diğer alanlar isteğe bağlıdır. </p>
          </div>
        </div>
        {submittedVehicle && (
          <div
            role="status"
            className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          >
            <p className="font-semibold">
              Form doğrulaması başarılı!
            </p>

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
          submitLabel="Bilgileri Kontrol Et"
        />
      </div>
    </div>
  );
}