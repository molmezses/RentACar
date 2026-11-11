
import type {
  FleetStatus,
  FuelType,
  Transmission,
  VehicleDisplayData,
} from "@/types/vehicle";

export type VehicleListOptions = {
  search: string;
  fleetStatus: FleetStatus | "";
  transmission: Transmission | "";
  fuelType: FuelType | "";
  sortBy: "newest" | "make" | "priceAsc" | "priceDesc";
};

export const defaultVehicleListOptions: VehicleListOptions = {
  search: "",
  fleetStatus: "",
  transmission: "",
  fuelType: "",
  sortBy: "newest",
};

export function filterAndSortVehicles(
  vehicles: VehicleDisplayData[],
  options: VehicleListOptions,
): VehicleDisplayData[] {
  const search = options.search.trim().toLocaleLowerCase("tr-TR");

  const filtered = vehicles.filter((vehicle) => {
    const searchableText = [
      vehicle.make,
      vehicle.model,
      vehicle.plate,
    ]
      .join(" ")
      .toLocaleLowerCase("tr-TR");

    return (
      (!search || searchableText.includes(search)) &&
      (!options.fleetStatus ||
        vehicle.fleetStatus === options.fleetStatus) &&
      (!options.transmission ||
        vehicle.transmission === options.transmission) &&
      (!options.fuelType ||
        vehicle.fuelType === options.fuelType)
    );
  });

  return [...filtered].sort((a, b) => {
    switch (options.sortBy) {
      case "make":
        return a.make.localeCompare(b.make, "tr-TR");

      case "priceAsc":
        return Number(a.dailyPrice) - Number(b.dailyPrice);

      case "priceDesc":
        return Number(b.dailyPrice) - Number(a.dailyPrice);

      case "newest":
      default:
        return b.modelYear - a.modelYear;
    }
  });
}
