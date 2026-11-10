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
    plate: [2, 20],
    make: [1, 60],
    model: [1, 80],
  } as const;

  for (const field of Object.keys(textFields) as Array<
    keyof typeof textFields
  >) {
    const [min, max] = textFields[field];
    const value = values[field].trim();

    if (value.length < min || value.length > max) {
      errors[field] = `${min}-${max} karakter olmalı.`;
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
    field: "modelYear" | "seatCount" | "doorCount" |
      "odometerKm" | "includedMileageKm",
    min: number,
    max: number,
    required = false,
  ) {
    const value = values[field].trim();

    if (!value && !required) return;

    const number = Number(value);

    if (
      !value ||
      !/^\d+$/.test(value) ||
      !Number.isSafeInteger(number) ||
      number < min ||
      number > max
    ) {
      errors[field] = `Geçerli bir değer girin (${min}-${max}).`;
    }
  }

  checkInteger("modelYear", 1950, new Date().getFullYear() + 1, true);
  checkInteger("seatCount", 1, 20, true);
  checkInteger("doorCount", 1, 8);
  checkInteger("odometerKm", 0, Number.MAX_SAFE_INTEGER, true);
  checkInteger("includedMileageKm", 0, Number.MAX_SAFE_INTEGER);

  // Parasal değerleri Number'a dönüştürmeden doğrula
  function checkMoney(
    field: "dailyPrice" | "depositAmount" | "extraKmPrice",
    required = false,
    positive = false,
  ) {
    const value = values[field].trim();

    if (!value && !required) return;

    // Decimal(12,2): en fazla 10 tam, 2 ondalık basamak
    const validFormat = /^(?:0|[1-9]\d{0,9})(?:\.\d{1,2})?$/.test(value);
    const zero = /^0(?:\.0{1,2})?$/.test(value);

    if (!validFormat || (positive && zero)) {
      errors[field] = "Geçerli bir tutar girin.";
    }
  }

  checkMoney("dailyPrice", true, true);
  checkMoney("depositAmount");
  checkMoney("extraKmPrice");

  return errors;
}
