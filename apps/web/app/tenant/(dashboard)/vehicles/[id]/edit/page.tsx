"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import VehicleForm from "@/components/vehicles/VehicleForm";

import {
    fetchVehicle,
    updateVehicle,
    VehicleApiError,
} from "@/lib/vehicles/api";

import {
    vehicleToFormValues,
    formValuesToCreateInput,
    getVehicleUpdateInput,
} from "@/lib/vehicles/form-utils";

import type {
    Vehicle,
    CreateVehicleInput,
    VehicleFormValues,
} from "@/types/vehicle";

import type { VehicleValidationErrors } from "@/lib/vehicles/validation";
import { mapVehicleApiErrors } from "@/lib/vehicles/error-utils";

//2 asenkron işlem var
//GET: araç bilgilerini yükleme
//PATCH: araç bilgilerini güncelleme
export default function TenantVehicleEditPage() {
    const router = useRouter();
    const { id } = useParams<{ id: string }>();

    const [vehicle, setVehicle] =
        useState<Omit<Vehicle, "tenantId"> | null>(null);

    const [isLoading, setIsLoading] = useState(true);

    const [loadError, setLoadError] =
        useState<string | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);

    const [submitError, setSubmitError] =
        useState<string | null>(null);

    const [serverErrors, setServerErrors] =
        useState<VehicleValidationErrors>({});

    const submittingRef = useRef(false);

    useEffect(() => {
        const controller = new AbortController();

        async function loadVehicle() {
            setIsLoading(true);
            setLoadError(null);
            setVehicle(null);

            try {
                const data = await fetchVehicle(
                    id,
                    controller.signal,
                );

                if (controller.signal.aborted) {
                    return;
                }

                setVehicle(data);
            } catch (error) {
                if (controller.signal.aborted) {
                    return;
                }

                if (error instanceof VehicleApiError) {
                    if (error.status === 401) {
                        router.replace("/tenant/session");
                        return;
                    }

                    if (error.status === 403) {
                        setLoadError(
                            "Bu aracı görüntüleme yetkiniz bulunmuyor.",
                        );
                        return;
                    }

                    if (error.status === 404) {
                        setLoadError("Düzenlemek istediğiniz araç bulunamadı.");
                        return;
                    }

                    setLoadError(error.message);
                } else {
                    setLoadError(
                        "Araç bilgileri yüklenirken beklenmeyen bir hata oluştu.",
                    );
                }
            } finally {
                if (!controller.signal.aborted) {
                    setIsLoading(false);
                }
            }
        }

        void loadVehicle();

        return () => {
            controller.abort();
        };
    }, [id, router]);

    async function handleSubmit(values: CreateVehicleInput) {
        if (submittingRef.current || !vehicle || vehicle.id !== id) {
            return;
        }

        setSubmitError(null);
        setServerErrors({});

        const initialValues = vehicleToFormValues(vehicle);

        const initialInput = formValuesToCreateInput(initialValues);

        const updateInput = getVehicleUpdateInput(initialInput, values);

        if (Object.keys(updateInput).length === 0) {
            setSubmitError(
                "Güncellenecek herhangi bir değişiklik bulunmuyor.",
            );
            return;
        }

        submittingRef.current = true;
        setIsSubmitting(true);

        try {
            await updateVehicle(id, updateInput);

            router.push("/tenant/vehicles");
        } catch (error) {
            if (error instanceof VehicleApiError) {
                if (error.status === 401) {
                    router.replace("/tenant/session");
                    return;
                }

                if (error.status === 403) {
                    setSubmitError(
                        "Bu aracı güncelleme yetkiniz bulunmuyor.",
                    );
                } else if (error.status === 404) {
                    setSubmitError(
                        "Güncellemek istediğiniz araç bulunamadı.",
                    );
                } else {
                    const { fieldErrors, generalError } =
                        mapVehicleApiErrors(error);

                    setServerErrors(fieldErrors);
                    setSubmitError(generalError);
                }
            } else {
                setSubmitError(
                    "Araç güncellenirken beklenmeyen bir hata oluştu.",
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

    if (isLoading) {
        return (
            <div className="w-full min-w-0 px-5 py-6 md:px-8 xl:px-10">
                <p role="status" className="text-sm text-slate-600">
                    Araç bilgileri yükleniyor...
                </p>
            </div>
        );
    }

    if (loadError || !vehicle) {
        return (
            <div className="w-full min-w-0 px-5 py-6 md:px-8 xl:px-10">
                <div
                    role="alert"
                    className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900"
                >
                    {loadError ?? "Araç bulunamadı."}
                </div>

                <button
                    type="button"
                    onClick={handleCancel}
                    className="mt-4 rounded-lg bg-[#17674c] px-4 py-2 text-sm font-medium text-white"
                >
                    Araç Listesine Dön
                </button>
            </div>
        );
    }

    return (
        <div className="w-full min-w-0 px-5 py-6 md:px-8 xl:px-10">
            <div className="mx-auto max-w-5xl space-y-6">
                <div>
                    <h1 className="text-2xl font-semibold text-[#172e26]">
                        Araç Düzenle
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        {vehicle.make} {vehicle.model} — {vehicle.plate}
                    </p>
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
                    key={vehicle.id}
                    initialValues={vehicleToFormValues(vehicle)}
                    onSubmit={handleSubmit}
                    onCancel={handleCancel}
                    isSubmitting={isSubmitting}
                    serverErrors={serverErrors}
                    onFieldChange={handleFieldChange}
                    submitLabel={
                        isSubmitting
                            ? "Kaydediliyor..."
                            : "Değişiklikleri Kaydet"
                    }
                />
            </div>
        </div>
    );
}