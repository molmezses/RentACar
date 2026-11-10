"use client";

import { useState, type FormEvent } from "react";

import {
  validateVehicleForm,
  type VehicleValidationErrors,
} from "@/lib/vehicles/validation";
import type {
  CreateVehicleInput,
  VehicleFormValues,
} from "@/types/vehicle";

type VehicleFormProps = {
  initialValues?: Partial<VehicleFormValues>;
  onSubmit: (vehicle: CreateVehicleInput) => void;
  isSubmitting?: boolean;
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
    ["TRY", "TL"],
    ["USD", "USD"],
    ["EUR", "EUR"],
  ],
} as const;

type TextField = Exclude<
  keyof VehicleFormValues,
  "hasAirConditioning"
>;

const fields: {
  name: TextField;
  label: string;
  type?: string;
  required?: boolean;
}[] = [
  { name: "plate", label: "Plaka", required: true },
  { name: "vin", label: "Şasi numarası" },
  { name: "internalCode", label: "İç kod" },
  { name: "make", label: "Marka", required: true },
  { name: "model", label: "Model", required: true },
  { name: "modelYear", label: "Model yılı", type: "number", required: true },
  { name: "trim", label: "Donanım" },
  { name: "color", label: "Renk" },
  { name: "seatCount", label: "Koltuk sayısı", type: "number", required: true },
  { name: "doorCount", label: "Kapı sayısı", type: "number" },
  { name: "odometerKm", label: "Kilometre", type: "number", required: true },
  { name: "currentLocationLabel", label: "Konum" },
  { name: "dailyPrice", label: "Günlük fiyat", required: true },
  { name: "depositAmount", label: "Depozito" },
  { name: "includedMileageKm", label: "Dahil kilometre", type: "number" },
  { name: "extraKmPrice", label: "Ek kilometre ücreti" },
];

function optionalText(value: string): string | null {
  return value.trim() || null;
}

function optionalNumber(value: string): number | null {
  return value.trim() ? Number(value) : null;
}

export default function VehicleForm({
  initialValues,
  onSubmit,
  isSubmitting = false,
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
    setValues((previous) => ({ ...previous, [field]: value }));
    setErrors((previous) => ({ ...previous, [field]: undefined }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const validationErrors = validateVehicleForm(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // Validation başarılı: boş seçimler artık mümkün değil.
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
      <div className="grid gap-4 sm:grid-cols-2">
        {fields.map(({ name, label, type = "text", required }) => (
          <div key={name} className="space-y-1">
            <label
              htmlFor={`vehicle-${name}`}
              className="block text-sm font-medium text-slate-700"
            >
              {label}{required ? " *" : ""}
            </label>

            <input
              id={`vehicle-${name}`}
              type={type}
              value={values[name]}
              required={required}
              aria-invalid={Boolean(errors[name])}
              aria-describedby={errors[name] ? `error-${name}` : undefined}
              onChange={(event) => updateField(name, event.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            />

            {errors[name] && (
              <p id={`error-${name}`} role="alert" className="text-xs text-red-600">
                {errors[name]}
              </p>
            )}
          </div>
        ))}

        {(
          [
            ["category", "Kategori"],
            ["transmission", "Vites"],
            ["fuelType", "Yakıt türü"],
            ["currency", "Para birimi"],
          ] as const
        ).map(([name, label]) => (
          <div key={name} className="space-y-1">
            <label
              htmlFor={`vehicle-${name}`}
              className="block text-sm font-medium text-slate-700"
            >
              {label} *
            </label>

            <select
              id={`vehicle-${name}`}
              value={values[name]}
              aria-invalid={Boolean(errors[name])}
              aria-describedby={errors[name] ? `error-${name}` : undefined}
              onChange={(event) => updateField(name,event.target.value as VehicleFormValues[typeof name])}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
            >
              <option value="">Seçiniz</option>
              {selectOptions[name].map(([value, text]) => (
                <option key={value} value={value}>
                  {text}
                </option>
              ))}
            </select>

            {errors[name] && (
              <p id={`error-${name}`} role="alert" className="text-xs text-red-600">
                {errors[name]}
              </p>
            )}
          </div>
        ))}
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={values.hasAirConditioning}
          onChange={(event) =>
            updateField("hasAirConditioning", event.target.checked)
          }
        />
        Klima var
      </label>

      <div className="space-y-1">
        <label
          htmlFor="vehicle-notes"
          className="block text-sm font-medium text-slate-700"
        >
          Notlar
        </label>
        <textarea
          id="vehicle-notes"
          rows={3}
          value={values.notes}
          aria-invalid={Boolean(errors.notes)}
          aria-describedby={errors.notes ? "error-notes" : undefined}
          onChange={(event) => updateField("notes", event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900"
        />
        {errors.notes && (
          <p id="error-notes" role="alert" className="text-xs text-red-600">
            {errors.notes}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting ? "Kaydediliyor..." : "Aracı Kaydet"}
      </button>
    </form>
  );
}
