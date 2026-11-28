//Araç ekleme ve düzenleme ekranlarının ana işleyişi
//Form alanlarını oluşturuyor,kullanıcının girdiği verileri tutuyor,doğruluyor ve gönderime hazırlıyor
"use client";

import { useState, type FormEvent } from "react";

import VehicleFormSection from "./VehicleFormSection";
import {
  validateVehicleForm,
  type VehicleValidationErrors,
} from "@/lib/vehicles/validation";
import type { CreateVehicleInput, VehicleFormValues } from "@/types/vehicle";
import { formValuesToCreateInput } from "@/lib/vehicles/form-utils";

type VehicleFormProps = {
  initialValues?: Partial<VehicleFormValues>;
  onSubmit: (vehicle: CreateVehicleInput) => void;
  onCancel?: () => void;
  isSubmitting?: boolean;
  submitLabel?: string;
  serverErrors?: VehicleValidationErrors;
  onFieldChange?: (field: keyof VehicleFormValues) => void;
};

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
  hasAirConditioning: null,
  odometerKm: "",
  currentLocationLabel: "",
  notes: "",
  dailyPrice: "",
  currency: "TRY",
  depositAmount: "",
  includedMileageKm: "",
  extraKmPrice: "",
};

type SelectFieldName = "category" | "transmission" | "fuelType" | "currency";
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
      placeholder?: string;
    }
  | {
      kind: "select";
      name: SelectFieldName;
      label: string;
      required?: boolean;
    };

type VehicleSectionId = "identity" | "technical" | "operations" | "pricing";

const sections: {
  id: VehicleSectionId;
  title: string;
  description: string;
  fields: FormField[];
}[] = [
  {
    id: "identity",
    title: "Araç Kimliği",
    description: "Aracın kimlik ve model bilgilerini girin.",
    fields: [
      { kind: "text", name: "make", label: "Marka", required: true, placeholder: "Örn. Toyota" },
      { kind: "text", name: "model", label: "Model", required: true, placeholder: "Örn. Corolla" },
      { kind: "text", name: "plate", label: "Plaka", required: true, placeholder: "Örn. 34 ABC 123" },
      { kind: "text", name: "modelYear", label: "Model yılı", required: true, inputMode: "numeric", placeholder: "Örn. 2024" },
      { kind: "select", name: "category", label: "Kategori", required: true },
      { kind: "text", name: "color", label: "Renk", placeholder: "Örn. Beyaz" },
      { kind: "text", name: "vin", label: "Şasi numarası", placeholder: "Örn. JTDBR32E..." },
      { kind: "text", name: "trim", label: "Donanım", placeholder: "Örn. Comfort" },
    ],
  },
  {
    id: "technical",
    title: "Teknik Bilgiler",
    description: "Aracın teknik özelliklerini belirleyin.",
    fields: [
      { kind: "select", name: "transmission", label: "Vites", required: true },
      { kind: "select", name: "fuelType", label: "Yakıt türü", required: true },
      { kind: "text", name: "seatCount", label: "Koltuk sayısı", required: true, inputMode: "numeric", placeholder: "Örn. 5" },
      { kind: "text", name: "odometerKm", label: "Kilometre", required: true, inputMode: "numeric", placeholder: "Örn. 42500" },
      { kind: "text", name: "doorCount", label: "Kapı sayısı", inputMode: "numeric", placeholder: "Örn. 4" },
    ],
  },
  {
    id: "operations",
    title: "Operasyon",
    description: "Firma içi takip için ek bilgileri girin.",
    fields: [
      { kind: "text", name: "internalCode", label: "İç kod", placeholder: "Örn. ARAÇ-001" },
      { kind: "text", name: "currentLocationLabel", label: "Araç konumu", placeholder: "Örn. İstanbul Havalimanı" },
    ],
  },
  {
    id: "pricing",
    title: "Fiyatlandırma",
    description: "Fiyat ve kiralama koşullarını belirleyin.",
    fields: [
      { kind: "text", name: "dailyPrice", label: "Günlük fiyat", required: true, inputMode: "decimal", placeholder: "Örn. 1250.00" },
      { kind: "select", name: "currency", label: "Para birimi", required: true },
      { kind: "text", name: "depositAmount", label: "Depozito", inputMode: "decimal", placeholder: "Örn. 5000.00" },
      { kind: "text", name: "includedMileageKm", label: "Dahil kilometre", inputMode: "numeric", placeholder: "Örn. 200" },
      { kind: "text", name: "extraKmPrice", label: "Ek kilometre ücreti", inputMode: "decimal", placeholder: "Örn. 4.00" },
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

const fieldControlClass =
  "h-9 w-full min-w-0 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#17674c] focus:ring-2 focus:ring-emerald-100";

export default function VehicleForm({
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting = false,
  submitLabel = "Aracı Kaydet",
  serverErrors = {},
  onFieldChange,
}: VehicleFormProps) {
  const [values, setValues] = useState<VehicleFormValues>({
    ...emptyValues,
    ...initialValues,
  });
  const [errors, setErrors] = useState<VehicleValidationErrors>({});

  const fieldErrors = { ...serverErrors };

  for (const field of Object.keys(errors) as Array<
    keyof VehicleFormValues
  >) {
    const message = errors[field];

    if (message) {
      fieldErrors[field] = message;
    }
  }

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

    onFieldChange?.(field);
  }

  function handleCancel() {
    const initial = { ...emptyValues, ...initialValues };
    const hasChanges = (Object.keys(values) as Array<keyof VehicleFormValues>).some(
      (field) => values[field] !== initial[field],
    );

    if (hasChanges) {
      const confirmed = window.confirm(
        "Kaydedilmemiş değişiklikleriniz var. Formdan çıkmak istiyor musunuz?",
      );
      if (!confirmed) return;
    }

    onCancel?.();
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting) return;
    const validationErrors = validateVehicleForm(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstInvalidInput = Array.from(
        event.currentTarget.querySelectorAll<
          HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >("input[name], select[name], textarea[name]"),
      ).find(
        (input) =>
          input.name in validationErrors &&
          Boolean(validationErrors[input.name as keyof VehicleFormValues]),
      );
      firstInvalidInput?.focus();
      return;
    }

    const vehicle = formValuesToCreateInput(values);

    onSubmit(vehicle);
  }

  const currencySymbol =
    values.currency === "USD" ? "$" : values.currency === "EUR" ? "€" : "₺";

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {sections.map((section) => (
        <VehicleFormSection
          key={section.id}
          id={section.id}
          title={section.title}
          description={section.description}
        >
          {section.fields.map((field) => {
            const inputId = `vehicle-${field.name}`;
            const errorId = `vehicle-error-${field.name}`;
            const error = fieldErrors[field.name];
            const suffix =
              field.name === "odometerKm" || field.name === "includedMileageKm"
                ? "km"
                : field.name === "extraKmPrice"
                  ? `${currencySymbol}/km`
                  : null;

            return (
              <div
                key={field.name}
                className="grid min-w-0 grid-cols-1 gap-2 lg:grid-cols-[104px_minmax(0,1fr)] lg:items-center"
              >
                <label htmlFor={inputId} className="text-sm font-semibold text-slate-700">
                  {field.label}
                  {field.required && (
                    <span className="ml-1 text-rose-600" aria-hidden="true">*</span>
                  )}
                </label>

                {field.kind === "select" ? (
                  <select
                    id={inputId}
                    name={field.name}
                    required={field.required}
                    disabled={isSubmitting}
                    value={values[field.name]}
                    aria-invalid={Boolean(error)}
                    aria-describedby={error ? errorId : undefined}
                    onChange={(event) =>
                      updateField(
                        field.name,
                        event.target.value as VehicleFormValues[typeof field.name],
                      )
                    }
                    className={fieldControlClass}
                  >
                    <option value="" disabled>{field.label} seçin</option>
                    {selectOptions[field.name].map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                ) : (
                  <div className={suffix ? "flex min-w-0 overflow-hidden rounded-md" : "min-w-0"}>
                    <input
                      id={inputId}
                      name={field.name}
                      type="text"
                      disabled={isSubmitting}
                      inputMode={field.inputMode ?? "text"}
                      placeholder={field.placeholder}
                      required={field.required}
                      value={values[field.name]}
                      aria-invalid={Boolean(error)}
                      aria-describedby={error ? errorId : undefined}
                      onChange={(event) => updateField(field.name, event.target.value)}
                      className={
                        suffix
                          ? `${fieldControlClass} flex-1 rounded-r-none border-r-0 focus:relative focus:z-10`
                          : fieldControlClass
                      }
                    />
                    {suffix && (
                      <span
                        aria-hidden="true"
                        className="flex h-9 shrink-0 items-center justify-center rounded-r-md border border-slate-300 bg-slate-100 px-3 text-xs font-medium text-slate-600"
                      >
                        {suffix}
                      </span>
                    )}
                  </div>
                )}

                {error && (
                  <p id={errorId} role="alert" className="text-xs font-medium text-rose-600 lg:col-start-2">
                    {error}
                  </p>
                )}
              </div>
            );
          })}

          {section.id === "technical" && (
            <div className="grid min-w-0 grid-cols-1 gap-2 lg:grid-cols-[104px_minmax(0,1fr)] lg:items-center">
              <label htmlFor="vehicle-air-conditioning" className="whitespace-nowrap text-sm font-semibold text-slate-700">
                Klima durumu
              </label>
              <select
                id="vehicle-air-conditioning"
                name="hasAirConditioning"
                disabled={isSubmitting}
                aria-invalid={Boolean(fieldErrors.hasAirConditioning)}
                aria-describedby={fieldErrors.hasAirConditioning ? "vehicle-error-hasAirConditioning" : undefined}
                value={values.hasAirConditioning === null ? "" : values.hasAirConditioning ? "true" : "false"}
                onChange={(event) => {
                  const selected = event.target.value;
                  updateField("hasAirConditioning", selected === "" ? null : selected === "true");
                }}
                className={fieldControlClass}
              >
                <option value="">Belirtilmedi</option>
                <option value="true">Klima var</option>
                <option value="false">Klima yok</option>
              </select>
              {fieldErrors.hasAirConditioning && (
                <p id="vehicle-error-hasAirConditioning" role="alert" className="text-xs font-medium text-rose-600 lg:col-start-2">
                  {fieldErrors.hasAirConditioning}
                </p>
              )}
            </div>
          )}

          {section.id === "operations" && (
            <div className="grid min-w-0 grid-cols-1 gap-2 sm:col-span-2 lg:grid-cols-[104px_minmax(0,1fr)]">
              <label htmlFor="vehicle-notes" className="text-sm font-semibold text-slate-700">
                İç notlar
              </label>
              <textarea
                id="vehicle-notes"
                name="notes"
                disabled={isSubmitting}
                rows={4}
                placeholder="Araçla ilgili ek notlar (isteğe bağlı)"
                value={values.notes}
                aria-invalid={Boolean(fieldErrors.notes)}
                aria-describedby={fieldErrors.notes ? "vehicle-error-notes" : undefined}
                onChange={(event) => updateField("notes", event.target.value)}
                className="min-h-20 w-full min-w-0 resize-y rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-[#17674c] focus:ring-2 focus:ring-emerald-100"
              />
              {fieldErrors.notes && (
                <p id="vehicle-error-notes" role="alert" className="text-xs font-medium text-rose-600 lg:col-start-2">
                  {fieldErrors.notes}
                </p>
              )}
            </div>
          )}
        </VehicleFormSection>
      ))}

      <div className="flex flex-wrap items-center justify-center gap-3 border-t border-slate-200 px-5 py-5 sm:px-6">
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#176548] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#14533b] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#176548] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting ? "İşleniyor..." : submitLabel}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-400 disabled:cursor-not-allowed disabled:opacity-50"
          >
            İptal
          </button>
        )}
      </div>
    </form>
  );
}
