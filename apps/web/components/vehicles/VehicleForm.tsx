//Araç ekleme ve düzenleme ekranlarının ana işleyişi
//Form alanlarını oluşturuyor,kullanıcının girdiği verileri tutuyor,doğruluyor ve gönderime hazırlıyor
"use client";

import { useState, type FormEvent } from "react";

import VehicleFormSection from "./VehicleFormSection";

import {
  validateVehicleForm,
  type VehicleValidationErrors,
} from "@/lib/vehicles/validation";

import type {
  CreateVehicleInput,
  VehicleFormValues,
} from "@/types/vehicle";

//Form dışarıdan hangi özellikleri alcak
type VehicleFormProps = {
  initialValues?: Partial<VehicleFormValues>;
  onSubmit: (vehicle: CreateVehicleInput) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
};

//Yeni araç oluşturulurken formun başlangıçta hangi değerleri taşıyacak
const emptyValues: VehicleFormValues = {
  plate: "",
  vin: "",
  internalCode: "",
  make: "",
  model: "",
  modelYear: "",
  category: "",
  trim: "",
  color: "",
  transmission: "",
  fuelType: "",
  seatCount: "",
  doorCount: "",
  hasAirConditioning: false,
  odometerKm: "",
  currentLocationLabel: "",
  notes: "",
  dailyPrice: "",
  currency: "TRY",
  depositAmount: "",
  includedMileageKm: "",
  extraKmPrice: "",
};

type SelectFieldName =
  | "category"
  | "transmission"
  | "fuelType"
  | "currency";

type TextFieldName = Exclude<
  keyof VehicleFormValues,
  SelectFieldName | "hasAirConditioning" | "notes"
>;

type FormField =
  | {
      kind: "text";
      name: TextFieldName;
      label: string;
      required?: boolean;
      inputMode?: "numeric" | "decimal";
    }
  | {
      kind: "select";
      name: SelectFieldName;
      label: string;
      required?: boolean;
    };

const sections: {
  title: string;
  description: string;
  fields: FormField[];
}[] = [
  {
    title: "Araç Bilgileri",
    description: "Aracın kimlik ve model bilgilerini girin.",
    fields: [
      { kind: "text", name: "make", label: "Marka", required: true },
      { kind: "text", name: "model", label: "Model", required: true },
      { kind: "text", name: "plate", label: "Plaka", required: true },
      {
        kind: "text",
        name: "modelYear",
        label: "Model yılı",
        required: true,
        inputMode: "numeric",
      },
      { kind: "select", name: "category", label: "Kategori", required: true },
      { kind: "text", name: "color", label: "Renk" },
      { kind: "text", name: "vin", label: "Şasi numarası" },
      { kind: "text", name: "trim", label: "Donanım" },
    ],
  },
  {
    title: "Teknik Özellikler",
    description: "Aracın teknik özelliklerini belirleyin.",
    fields: [
      { kind: "select", name: "transmission", label: "Vites", required: true },
      { kind: "select", name: "fuelType", label: "Yakıt türü", required: true },
      {
        kind: "text",
        name: "seatCount",
        label: "Koltuk sayısı",
        required: true,
        inputMode: "numeric",
      },
      {
        kind: "text",
        name: "odometerKm",
        label: "Kilometre",
        required: true,
        inputMode: "numeric",
      },
      {
        kind: "text",
        name: "doorCount",
        label: "Kapı sayısı",
        inputMode: "numeric",
      },
    ],
  },
  {
    title: "Kiralama Bilgileri",
    description: "Fiyat ve kiralama koşullarını belirleyin.",
    fields: [
      {
        kind: "text",
        name: "dailyPrice",
        label: "Günlük fiyat",
        required: true,
        inputMode: "decimal",
      },
      { kind: "select", name: "currency", label: "Para birimi", required: true },
      {
        kind: "text",
        name: "depositAmount",
        label: "Depozito",
        inputMode: "decimal",
      },
      {
        kind: "text",
        name: "includedMileageKm",
        label: "Dahil kilometre",
        inputMode: "numeric",
      },
      {
        kind: "text",
        name: "extraKmPrice",
        label: "Ek kilometre ücreti",
        inputMode: "decimal",
      },
    ],
  },
  {
    title: "Operasyonel Bilgiler",
    description: "Firma içi takip için ek bilgileri girin.",
    fields: [
      { kind: "text", name: "internalCode", label: "İç kod" },
      {
        kind: "text",
        name: "currentLocationLabel",
        label: "Araç konumu",
      },
    ],
  },
];

const selectOptions = {
  category: [
    ["ECONOMY", "Ekonomi"],
    ["COMPACT", "Kompakt"],
    ["SEDAN", "Sedan"],
    ["SUV", "SUV"],
    ["LUXURY", "Lüks"],
    ["VAN", "Van"],
    ["OTHER", "Diğer"],
  ],
  transmission: [
    ["MANUAL", "Manuel"],
    ["AUTOMATIC", "Otomatik"],
  ],
  fuelType: [
    ["PETROL", "Benzin"],
    ["DIESEL", "Dizel"],
    ["HYBRID", "Hibrit"],
    ["ELECTRIC", "Elektrik"],
    ["LPG", "LPG"],
    ["OTHER", "Diğer"],
  ],
  currency: [
    ["TRY", "Türk Lirası"],
    ["USD", "Amerikan Doları"],
    ["EUR", "Euro"],
  ],
} as const;

function optionalText(value: string): string | null {
  return value.trim() || null;
}

function optionalNumber(value: string): number | null {
  return value.trim() ? Number(value) : null;
}

export default function VehicleForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = "Aracı Kaydet",
}: VehicleFormProps) {
  const [values, setValues] = useState<VehicleFormValues>({
    ...emptyValues,
    ...initialValues,
  });

  const [errors, setErrors] = useState<VehicleValidationErrors>({});

  function updateField<K extends keyof VehicleFormValues>(
    field: K,
    value: VehicleFormValues[K],
  ) {
    setValues((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));
  }

  //form değerlerini CreateVehicleInput yapısına dönüştürür
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateVehicleForm(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    const vehicle: CreateVehicleInput = {
      plate: values.plate.trim().toUpperCase(),
      make: values.make.trim(),
      model: values.model.trim(),
      modelYear: Number(values.modelYear),
      category: values.category as CreateVehicleInput["category"],
      transmission: values.transmission as CreateVehicleInput["transmission"],
      fuelType: values.fuelType as CreateVehicleInput["fuelType"],
      seatCount: Number(values.seatCount),
      odometerKm: Number(values.odometerKm),
      dailyPrice: values.dailyPrice.trim(),
      currency: values.currency as CreateVehicleInput["currency"],

      vin: optionalText(values.vin),
      internalCode: optionalText(values.internalCode),
      trim: optionalText(values.trim),
      color: optionalText(values.color),
      doorCount: optionalNumber(values.doorCount),
      hasAirConditioning: values.hasAirConditioning,
      currentLocationLabel: optionalText(values.currentLocationLabel),
      notes: optionalText(values.notes),
      depositAmount: optionalText(values.depositAmount),
      includedMileageKm: optionalNumber(values.includedMileageKm),
      extraKmPrice: optionalText(values.extraKmPrice),
    };

    onSubmit(vehicle);
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {sections.map((section) => (
        <VehicleFormSection
          key={section.title}
          title={section.title}
          description={section.description}
        >
          {section.fields.map((field) => {
            const inputId = `vehicle-${field.name}`;
            const errorId = `vehicle-error-${field.name}`;
            const error = errors[field.name];

            return (
              <div key={field.name} className="min-w-0 space-y-2">
                <label
                  htmlFor={inputId}
                  className="block text-sm font-semibold text-slate-700"
                >
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-rose-600" aria-hidden="true">
                      *
                    </span>
                  )}
                </label>

                {field.kind === "select" ? (
                  <select
                    id={inputId}
                    required={field.required}
                    value={values[field.name]}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? errorId : undefined}
                    onChange={(event) =>
                      updateField(
                        field.name,
                        event.target.value as VehicleFormValues[typeof field.name],
                      )
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="">Seçiniz</option>
                    {selectOptions[field.name].map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    id={inputId}
                    type="text"
                    inputMode={field.inputMode ?? "text"}
                    required={field.required}
                    value={values[field.name]}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? errorId : undefined}
                    onChange={(event) =>
                      updateField(field.name, event.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                )}

                {error && (
                  <p
                    id={errorId}
                    role="alert"
                    className="text-xs font-medium text-rose-600"
                  >
                    {error}
                  </p>
                )}
              </div>
            );
          })}

          {section.title === "Teknik Özellikler" && (
            <label className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
              <input
                type="checkbox"
                checked={values.hasAirConditioning}
                onChange={(event) =>
                  updateField("hasAirConditioning", event.target.checked)
                }
                className="h-4 w-4 accent-blue-600"
              />
              Klima var
            </label>
          )}

          {section.title === "Operasyonel Bilgiler" && (
            <div className="space-y-2 sm:col-span-2">
              <label
                htmlFor="vehicle-notes"
                className="block text-sm font-semibold text-slate-700"
              >
                İç notlar
              </label>

              <textarea
                id="vehicle-notes"
                rows={4}
                value={values.notes}
                aria-invalid={Boolean(errors.notes)}
                aria-describedby={
                  errors.notes ? "vehicle-error-notes" : undefined
                }
                onChange={(event) =>
                  updateField("notes", event.target.value)
                }
                className="w-full resize-y rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
              />

              {errors.notes && (
                <p
                  id="vehicle-error-notes"
                  role="alert"
                  className="text-xs font-medium text-rose-600"
                >
                  {errors.notes}
                </p>
              )}
            </div>
          )}
        </VehicleFormSection>
      ))}

      {/* Kaydet ve iptal */}
      <div className="flex flex-wrap items-center justify-end gap-3 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            İptal
          </button>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "İşleniyor..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
