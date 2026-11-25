//Araç listesindeki arama,filtreleme ve sıralama işlemlerini gerçekleştiren yardımcı fonksiyonalrı içerir
import type {
  FleetStatus,
  FuelType,
  Transmission,
  VehicleCategory,
  VehicleDisplayData,
} from "@/types/vehicle";

//Filtre seçeneklerinin tipi
export type VehicleListOptions = {
  search: string;
  category: VehicleCategory | "";
  fleetStatus: FleetStatus | "";
  transmission: Transmission | "";
  fuelType: FuelType | "";
  sortBy: "newest" | "make" | "priceAsc" | "priceDesc";
};

//Varsayılan seçenekler, başlangıç değerleri. Sayfa ilk açıldığında veya filtreler sıfırlandığında kullanılan değerlerdir
export const defaultVehicleListOptions: VehicleListOptions = {
  search: "",
  category: "",
  fleetStatus: "",
  transmission: "",
  fuelType: "",
  sortBy: "newest",
};

//Filtrelenmiş ve sıralanmış bir araç listesi döndürür
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
      (!options.category ||
        vehicle.category === options.category) &&
      (!options.fleetStatus ||
        vehicle.fleetStatus === options.fleetStatus) &&
      (!options.transmission ||
        vehicle.transmission === options.transmission) &&
      (!options.fuelType ||
        vehicle.fuelType === options.fuelType)
    );
  });
  //Sıralama işlemi
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
