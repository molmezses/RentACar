
import { describe, expect, it } from "vitest";

import type { VehicleFormValues } from "@/types/vehicle";
import { validateVehicleForm } from "./validation";

const validVehicle: VehicleFormValues = {
  plate: "38 ABC 123",
  vin: "",
  internalCode: "",
  make: "Toyota",
  model: "Corolla",
  modelYear: "2022",
  category: "SEDAN",
  trim: "",
  color: "White",
  transmission: "AUTOMATIC",
  fuelType: "PETROL",
  seatCount: "5",
  doorCount: "4",
  hasAirConditioning: true,
  odometerKm: "42500",
  currentLocationLabel: "Kayseri",
  notes: "",
  dailyPrice: "1500.00",
  currency: "TRY",
  depositAmount: "",
  includedMileageKm: "",
  extraKmPrice: "",
};

describe("validateVehicleForm", () => {
  it("accepts valid vehicle information", () => {
    expect(validateVehicleForm(validVehicle)).toEqual({});
  });

  it("rejects an empty license plate", () => {
    const errors = validateVehicleForm({
      ...validVehicle,
      plate: "",
    });

    expect(errors.plate).toBeDefined();
  });

  it("rejects negative mileage", () => {
    const errors = validateVehicleForm({
      ...validVehicle,
      odometerKm: "-100",
    });

    expect(errors.odometerKm).toBeDefined();
  });

  it("rejects an invalid model year", () => {
    const errors = validateVehicleForm({
      ...validVehicle,
      modelYear: "1800",
    });

    expect(errors.modelYear).toBeDefined();
  });

  it("rejects invalid enum values", () => {
    const errors = validateVehicleForm({
      ...validVehicle,
      transmission: "INVALID" as VehicleFormValues["transmission"],
    });

    expect(errors.transmission).toBeDefined();
  });

  it("rejects negative rental prices", () => {
    const errors = validateVehicleForm({
      ...validVehicle,
      dailyPrice: "-1500",
    });

    expect(errors.dailyPrice).toBeDefined();
  });
});
