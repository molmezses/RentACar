
import { describe, expect, it } from "vitest";

import { mockVehicles } from "./mock-data";
import {
  defaultVehicleListOptions,
  filterAndSortVehicles,
  type VehicleListOptions,
} from "./list-utils";

function filterWith(options: Partial<VehicleListOptions>) {
  return filterAndSortVehicles(mockVehicles, {
    ...defaultVehicleListOptions,
    ...options,
  });
}

describe("filterAndSortVehicles", () => {
  it("returns all vehicles when no filters are selected", () => {
    expect(filterWith({})).toHaveLength(2);
  });

  it("searches vehicles by brand", () => {
    const result = filterWith({ search: "toyota" });

    expect(result).toHaveLength(1);
    expect(result[0].make).toBe("Toyota");
  });

  it("searches vehicles by model", () => {
    const result = filterWith({ search: "clio" });

    expect(result).toHaveLength(1);
    expect(result[0].model).toBe("Clio");
  });

  it("searches vehicles by license plate", () => {
    const result = filterWith({ search: "38 ABC" });

    expect(result).toHaveLength(1);
    expect(result[0].plate).toBe("38 ABC 123");
  });

  it("filters vehicles by fleet status", () => {
    const result = filterWith({ fleetStatus: "ACTIVE" });

    expect(result).toHaveLength(1);
    expect(result[0].fleetStatus).toBe("ACTIVE");
  });

  it("filters vehicles by transmission", () => {
    const result = filterWith({ transmission: "MANUAL" });

    expect(result).toHaveLength(1);
    expect(result[0].transmission).toBe("MANUAL");
  });

  it("filters vehicles by fuel type", () => {
    const result = filterWith({ fuelType: "DIESEL" });

    expect(result).toHaveLength(1);
    expect(result[0].fuelType).toBe("DIESEL");
  });

  it("sorts vehicles by daily price ascending", () => {
    const result = filterWith({ sortBy: "priceAsc" });

    expect(result.map((vehicle) => vehicle.dailyPrice)).toEqual([
      "1100.00",
      "1500.00",
    ]);
  });

  it("does not mutate the original vehicle array", () => {
    const vehicles = [...mockVehicles];
    const originalOrder = vehicles.map((vehicle) => vehicle.id);

    filterAndSortVehicles(vehicles, {
      ...defaultVehicleListOptions,
      sortBy: "priceAsc",
    });

    expect(vehicles.map((vehicle) => vehicle.id)).toEqual(originalOrder);
  });

  it("returns an empty array when no vehicles match", () => {
    expect(filterWith({ search: "Ferrari" })).toEqual([]);
  });
});
