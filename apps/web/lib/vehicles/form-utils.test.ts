import { describe, expect, it } from "vitest";

import {
  formValuesToCreateInput,
  vehicleToFormValues,
  getVehicleUpdateInput,
} from "./form-utils";

import type { Vehicle, VehicleFormValues } from "@/types/vehicle";

const validFormValues: VehicleFormValues = {
  plate: " 34 abc 123 ",
  vin: "",
  internalCode: "",
  make: " Toyota ",
  model: " Corolla ",
  modelYear: "2024",
  category: "SEDAN",
  trim: "",
  color: " Beyaz ",
  transmission: "AUTOMATIC",
  fuelType: "PETROL",
  seatCount: "5",
  doorCount: "4",
  hasAirConditioning: null,
  odometerKm: "45000",
  currentLocationLabel: "",
  notes: "",
  dailyPrice: "1500.50",
  currency: "TRY",
  depositAmount: "",
  includedMileageKm: "0",
  extraKmPrice: "",
};

const existingVehicle: Vehicle = {
  id: "vehicle-1",
  tenantId: "tenant-1",

  plate: "34 ABC 123",
  vin: null,
  internalCode: null,

  make: "Toyota",
  model: "Corolla",
  modelYear: 2024,
  category: "SEDAN",
  trim: null,
  color: "Beyaz",

  transmission: "AUTOMATIC",
  fuelType: "PETROL",
  seatCount: 5,
  doorCount: null,
  hasAirConditioning: null,

  odometerKm: 45000,
  currentLocationLabel: null,
  notes: null,

  dailyPrice: "1500.50",
  currency: "TRY",
  depositAmount: null,
  includedMileageKm: 0,
  extraKmPrice: null,

  fleetStatus: "ACTIVE",
  deactivatedAt: null,

  createdAt: "2026-11-27T10:00:00.000Z",
  updatedAt: "2026-11-27T10:00:00.000Z",
};

describe("formValuesToCreateInput", () => {
  it("plaka ve metin alanlarını normalize eder", () => {
    const result = formValuesToCreateInput(validFormValues);

    expect(result.plate).toBe("34 ABC 123");
    expect(result.make).toBe("Toyota");
    expect(result.model).toBe("Corolla");
    expect(result.color).toBe("Beyaz");
  });

  it("sayısal form değerlerini number tipine dönüştürür", () => {
  const result = formValuesToCreateInput(validFormValues);

  expect(result.modelYear).toBe(2024);
  expect(result.seatCount).toBe(5);
  expect(result.doorCount).toBe(4);
  expect(result.odometerKm).toBe(45000);
  expect(result.includedMileageKm).toBe(0);
});

it("parasal değerleri decimal string olarak korur", () => {
  const result = formValuesToCreateInput({
    ...validFormValues,
    depositAmount: " 3000.00 ",
    extraKmPrice: "12.50",
  });

  expect(result.dailyPrice).toBe("1500.50");
  expect(result.depositAmount).toBe("3000.00");
  expect(result.extraKmPrice).toBe("12.50");
});

it("boş opsiyonel alanları null olarak dönüştürür", () => {
  const result = formValuesToCreateInput({
    ...validFormValues,
    doorCount: "",
    color: "   ",
  });

  expect(result.vin).toBeNull();
  expect(result.internalCode).toBeNull();
  expect(result.trim).toBeNull();
  expect(result.color).toBeNull();
  expect(result.doorCount).toBeNull();
  expect(result.currentLocationLabel).toBeNull();
  expect(result.notes).toBeNull();
  expect(result.depositAmount).toBeNull();
  expect(result.extraKmPrice).toBeNull();
});

it.each([true, false, null])(
  "klima bilgisini %s olarak korur",
  (hasAirConditioning) => {
    const result = formValuesToCreateInput({
      ...validFormValues,
      hasAirConditioning,
    });

    expect(result.hasAirConditioning).toBe(hasAirConditioning);
  },
);

});

describe("vehicleToFormValues", () => {
  it("araç verisini düzenleme formuna uygun hale getirir", () => {
    const result = vehicleToFormValues(existingVehicle);

    expect(result.plate).toBe("34 ABC 123");
    expect(result.make).toBe("Toyota");
    expect(result.modelYear).toBe("2024");
    expect(result.seatCount).toBe("5");
    expect(result.odometerKm).toBe("45000");
    expect(result.dailyPrice).toBe("1500.50");

    expect(result.vin).toBe("");
    expect(result.doorCount).toBe("");
    expect(result.depositAmount).toBe("");
    expect(result.includedMileageKm).toBe("0");
  });

  it.each([true, false, null])(
    "API'den gelen klima bilgisini %s olarak korur",
    (hasAirConditioning) => {
      const result = vehicleToFormValues({
        ...existingVehicle,
        hasAirConditioning,
      });

      expect(result.hasAirConditioning).toBe(hasAirConditioning);
    },
  );
});

describe("getVehicleUpdateInput", () => {
  const initial = formValuesToCreateInput(validFormValues);

  it("yalnızca değiştirilen alanları döndürür", () => {
    const result = getVehicleUpdateInput(initial, {
      ...initial,
      color: "Siyah",
      dailyPrice: "2000.00",
    });

    expect(result).toEqual({
      color: "Siyah",
      dailyPrice: "2000.00",
    });
  });

  it("temizlenen opsiyonel alanları null olarak korur", () => {
    const result = getVehicleUpdateInput(initial, {
      ...initial,
      color: null,
      doorCount: null,
    });

    expect(result).toEqual({
      color: null,
      doorCount: null,
    });
  });

  it("undefined alanları güncelleme verisine eklemez", () => {
    const result = getVehicleUpdateInput(initial, {
      ...initial,
      color: undefined,
    });

    expect(result).toEqual({});
  });

  it("değişiklik yoksa boş nesne döndürür", () => {
    const result = getVehicleUpdateInput(initial, {
      ...initial,
    });

    expect(result).toEqual({});
  });

  it("sıfır ve false değerlerini korur", () => {
    const result = getVehicleUpdateInput(initial, {
      ...initial,
      odometerKm: 0,
      hasAirConditioning: false,
    });

    expect(result).toEqual({
      odometerKm: 0,
      hasAirConditioning: false,
    });
  });
});