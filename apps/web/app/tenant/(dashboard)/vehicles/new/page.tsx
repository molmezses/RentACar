"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import VehicleForm from "@/components/vehicles/VehicleForm";
import type {
  CreateVehicleInput,
  VehicleFormValues,
} from "@/types/vehicle";

import {
  createVehicle,
  VehicleApiError,
} from "@/lib/vehicles/api";

import type { VehicleValidationErrors } from "@/lib/vehicles/validation";
import { mapVehicleApiErrors } from "@/lib/vehicles/error-utils";

export default function TenantVehicleCreatePage() {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);

  const [submitError, setSubmitError] =
    useState<string | null>(null);

  const [serverErrors, setServerErrors] =
  useState<VehicleValidationErrors>({});

  async function handleSubmit(vehicle: CreateVehicleInput) {
  if (submittingRef.current) {
    return;
  }

  submittingRef.current = true;
  setIsSubmitting(true);
  setSubmitError(null);
  setServerErrors({});

  try {
    const createdVehicle = await createVehicle(vehicle);

    router.push(
      `/tenant/vehicles/${encodeURIComponent(createdVehicle.id)}`,
    );
  } catch (error) {
    if (error instanceof VehicleApiError) {
      if (error.status === 401) {
        router.replace("/tenant/session");
        return;
      }

      const { fieldErrors, generalError } =
        mapVehicleApiErrors(error);

      setServerErrors(fieldErrors);
      setSubmitError(generalError);
    } else {
      setSubmitError(
        "Araç oluşturulurken beklenmeyen bir hata oluştu.",
      );
    }

    submittingRef.current = false;
    setIsSubmitting(false);
  }
}

function handleFieldChange(field: keyof VehicleFormValues) {
  setServerErrors((previous) => ({
    ...previous,
    [field]: undefined,
  }));
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
        {submitError && (
          <div
            role="alert"
            className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
          >
            {submitError}
          </div>
        )}
        <VehicleForm
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          serverErrors={serverErrors}
          onFieldChange={handleFieldChange}
          submitLabel={
            isSubmitting ? "Kaydediliyor..." : "Aracı Kaydet"
          }
        />
      </div>
    </div>
  );
}