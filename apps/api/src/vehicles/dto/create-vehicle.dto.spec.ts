import { describe, expect, it } from "vitest";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";

import { CreateVehicleDto } from "./create-vehicle.dto.js";

describe("CreateVehicleDto", () => {
  const validBody = () => ({
    plate: "38 ABC 123",
    make: "Toyota",
    model: "Corolla",
    modelYear: 2024,
    category: "SEDAN",
    transmission: "AUTOMATIC",
    fuelType: "HYBRID",
    seatCount: 5,
    odometerKm: 45000,
    dailyPrice: "1500.00",
    currency: "TRY",
  });

  async function getErrors(body: Record<string, unknown>) {
    const dto = plainToInstance(CreateVehicleDto, body);
    return validate(dto, {
      whitelist: true,
      forbidNonWhitelisted: true,
    });
  }

  it("geçerli zorunlu alanları kabul eder", async () => {
    const errors = await getErrors(validBody());

    expect(errors).toHaveLength(0);
  });

  it("plakayı normalize eder", async () => {
    const dto = plainToInstance(CreateVehicleDto, {
      ...validBody(),
      plate: " 38 abc 123 ",
    });

    expect(dto.plate).toBe("38 ABC 123");
    expect(await validate(dto)).toHaveLength(0);
  });

  it.each([
    ["tenantId", "tenant_other"],
    ["id", "vehicle_fake"],
    ["fleetStatus", "INACTIVE"],
    ["createdAt", "2026-11-25T10:00:00.000Z"],
    ["updatedAt", "2026-11-25T10:00:00.000Z"],
  ])("sistem alanı %s gönderilirse reddeder", async (field, value) => {
    const errors = await getErrors({
      ...validBody(),
      [field]: value,
    });

    expect(errors.some((error) => error.property === field)).toBe(true);
  });

  it.each([
    ["modelYear", 1900],
    ["seatCount", 25],
    ["odometerKm", -1],
    ["category", "INVALID"],
    ["dailyPrice", "0"],
    ["dailyPrice", "1500.999"],
    ["dailyPrice", 1500],
  ])("%s için geçersiz değeri reddeder: %s", async (field, value) => {
    const errors = await getErrors({
      ...validBody(),
      [field]: value,
    });

    expect(errors.some((error) => error.property === field)).toBe(true);
  });

  it("opsiyonel null değerleri kabul eder", async () => {
    const errors = await getErrors({
      ...validBody(),
      vin: null,
      depositAmount: null,
      extraKmPrice: null,
      hasAirConditioning: null,
    });

    expect(errors).toHaveLength(0);
  });

  it("opsiyonel false değerini kabul eder", async () => {
    const errors = await getErrors({
      ...validBody(),
      hasAirConditioning: false,
    });

    expect(errors).toHaveLength(0);
  });

  it("geçersiz VIN değerini reddeder", async () => {
    const errors = await getErrors({
      ...validBody(),
      vin: "INVALIDIOQ",
    });

    expect(errors.some((error) => error.property === "vin")).toBe(true);
  });

  it("opsiyonel negatif fiyatı reddeder", async () => {
    const errors = await getErrors({
      ...validBody(),
      depositAmount: "-100",
    });

    expect(errors.some((error) => error.property === "depositAmount")).toBe(
      true,
    );
  });

  it("boş opsiyonel fiyat alanlarını null değerine dönüştürür", async () => {
    const dto = plainToInstance(CreateVehicleDto, {
      ...validBody(),
      depositAmount: "",
      extraKmPrice: "   ",
    });

    expect(dto.depositAmount).toBeNull();
    expect(dto.extraKmPrice).toBeNull();

    expect(await validate(dto)).toHaveLength(0);
  });
});
