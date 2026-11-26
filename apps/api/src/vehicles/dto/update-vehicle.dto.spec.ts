import { describe, expect, it } from "vitest";
import { plainToInstance } from "class-transformer";
import { validate } from "class-validator";
import { UpdateVehicleDto } from "./update-vehicle.dto.js";
import { assertNonEmptyVehicleUpdate } from "./update-vehicle.dto.js";

async function validateUpdate(body: Record<string, unknown>) {
  const dto = plainToInstance(UpdateVehicleDto, body);

  return validate(dto, {
    whitelist: true,
    forbidNonWhitelisted: true,
  });
}

describe("UpdateVehicleDto", () => {
  it("allows updating a single field", async () => {
    const errors = await validateUpdate({
      make: "Honda",
    });

    expect(errors).toHaveLength(0);
  });

  it("rejects null for required fields", async () => {
    const errors = await validateUpdate({
      make: null,
    });

    expect(errors.length).toBeGreaterThan(0);
  });

  it("allows null for nullable fields", async () => {
    const errors = await validateUpdate({
      color: null,
    });

    expect(errors).toHaveLength(0);
  });

  it("rejects negative odometer values", async () => {
    const errors = await validateUpdate({
      odometerKm: -10,
    });

    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects system-owned fields", async () => {
    const errors = await validateUpdate({
      tenantId: "another-tenant",
    });

    expect(errors.length).toBeGreaterThan(0);
  });

  it("rejects an empty PATCH body", () => {
    expect(() => assertNonEmptyVehicleUpdate({} as UpdateVehicleDto)).toThrow(
      "At least one vehicle field must be provided.",
    );
  });

  it("allows a non-empty PATCH body", () => {
    expect(() =>
      assertNonEmptyVehicleUpdate({
        make: "Honda",
      } as UpdateVehicleDto),
    ).not.toThrow();
  });

  it("rejects null for dailyPrice", async () => {
    const errors = await validateUpdate({
      dailyPrice: null,
    });

    expect(errors.length).toBeGreaterThan(0);
  });

  it("accepts null for optional depositAmount", async () => {
    const errors = await validateUpdate({
      depositAmount: null,
    });

    expect(errors).toHaveLength(0);
  });

  it("rejects fleetStatus changes through general PATCH", async () => {
    const errors = await validateUpdate({
      fleetStatus: "INACTIVE",
    });

    expect(errors.length).toBeGreaterThan(0);
  });
});
