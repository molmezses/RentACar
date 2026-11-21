//Kullanıcı araç eklerken yanlış bilgiler girerse bunları kontrol ederiz

import type { VehicleFormValues } from "@/types/vehicle";

export type VehicleValidationErrors =
  Partial<Record<keyof VehicleFormValues, string>>;

const categories = [
  "ECONOMY", "COMPACT", "SEDAN", "SUV",
  "LUXURY", "VAN", "OTHER",
];

const transmissions = ["MANUAL", "AUTOMATIC"];

const fuelTypes = [
  "PETROL", "DIESEL", "HYBRID",
  "ELECTRIC", "LPG", "OTHER",
];

const currencies = ["TRY", "USD", "EUR"];

export function validateVehicleForm(
  values: VehicleFormValues,
): VehicleValidationErrors {
  const errors: VehicleValidationErrors = {};

  // Zorunlu metinler ve uzunluk sınırları
  const textFields = {
  plate: { label: "Plaka", min: 2, max: 20 },
  make: { label: "Marka", min: 1, max: 60 },
  model: { label: "Model", min: 1, max: 80 },
  } as const;

  for (const field of Object.keys(textFields) as Array<
    keyof typeof textFields
  >) {
    const { label, min, max } = textFields[field];
    const value = values[field].trim();

    if (!value) {
      errors[field] = `${label} alanı zorunludur.`;
    } else if (value.length < min || value.length > max) {
      errors[field] =
        `${label} ${min} ile ${max} karakter arasında olmalıdır.`;
    }
  }


  // Uluslararası plaka karakter kontrolü
  if (
    values.plate.trim() &&
    !/^[\p{L}\p{N} -]+$/u.test(values.plate.trim())
  ) {
    errors.plate = "Geçersiz plaka karakteri.";
  }

  // Opsiyonel metin alanları
  const optionalTextFields = {
    vin: 17,
    internalCode: 40,
    trim: 80,
    color: 40,
    currentLocationLabel: 120,
    notes: 2000,
  } as const;

  for (const field of Object.keys(optionalTextFields) as Array<
    keyof typeof optionalTextFields
  >) {
    if (values[field].trim().length > optionalTextFields[field]) {
      errors[field] = "Karakter sınırı aşıldı.";
    }
  }

  // VIN karakter kontrolü
  if (
    values.vin.trim() &&
    !/^[A-HJ-NPR-Z0-9]+$/i.test(values.vin.trim())
  ) {
    errors.vin = "Geçersiz şasi numarası.";
  }

  // Enum değerleri
  const enumFields = {
    category: categories,
    transmission: transmissions,
    fuelType: fuelTypes,
    currency: currencies,
  };

  for (const field of Object.keys(enumFields) as Array<
    keyof typeof enumFields
  >) {
    if (!enumFields[field].includes(values[field])) {
      errors[field] = "Geçerli bir seçim yapın.";
    }
  }

  // Tam sayı doğrulama yardımcısı
  function checkInteger(
    field:
      | "modelYear"
      | "seatCount"
      | "doorCount"
      | "odometerKm"
      | "includedMileageKm",
    label: string,
    min: number,
    max: number,
    required = false,
  ) {
    const value = values[field].trim();

    if (!value) {
      if (required) {
        errors[field] = `${label} alanı zorunludur.`;
      }
      return;
    }

    const number = Number(value);

    if (
      !/^\d+$/.test(value) ||
      !Number.isSafeInteger(number) ||
      number < min ||
      number > max
    ) {
      errors[field] =
        `${label} ${min} ile ${max} arasında bir tam sayı olmalıdır.`;
    }
  }

  checkInteger("modelYear", "Model yılı", 1950, new Date().getFullYear() + 1, true);
  checkInteger("seatCount", "Koltuk sayısı", 1, 20, true);
  checkInteger("doorCount", "Kapı sayısı", 1, 8);
  checkInteger("odometerKm", "Kilometre", 0, Number.MAX_SAFE_INTEGER, true);
  checkInteger("includedMileageKm", "Dahil kilometre", 0, Number.MAX_SAFE_INTEGER);

  // Parasal değerleri Number'a dönüştürmeden doğrula
  function checkMoney(
    field: "dailyPrice" | "depositAmount" | "extraKmPrice",
    label: string,
    required = false,
    positive = false,
  ) {
    const value = values[field].trim();

    if (!value) {
      if (required) {
        errors[field] = `${label} alanı zorunludur.`;
      }
      return;
    }

    // Decimal(12,2): en fazla 10 tam ve 2 ondalık basamak
    const validFormat = /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(value);
    const zero = /^0(?:\.0{1,2})?$/.test(value);

    if (!validFormat || (positive && zero)) {
      errors[field] = positive
        ? `${label} sıfırdan büyük olmalı ve en fazla 2 ondalık basamak içermelidir.`
        : `${label} geçerli bir tutar olmalı ve en fazla 2 ondalık basamak içermelidir.`;
    }
  }
  checkMoney("dailyPrice", "Günlük fiyat", true, true);
  checkMoney("depositAmount", "Depozito");
  checkMoney("extraKmPrice", "Ek kilometre ücreti");

  return errors;
}