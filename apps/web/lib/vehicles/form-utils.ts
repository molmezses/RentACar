//Veritabanından veya api den gelen araç bilgilerini,düzenleme formunun anlayacağı biçime dönüştürüyoruz
import type {
  Vehicle,
  VehicleFormValues,
} from "@/types/vehicle";

//Mevcut araç verisini düzenleme formuna uygun hale getirir
export function vehicleToFormValues(
  vehicle: Vehicle,
): VehicleFormValues {
  return {
    plate: vehicle.plate,
    vin: vehicle.vin ?? "",
    internalCode: vehicle.internalCode ?? "",

    make: vehicle.make,
    model: vehicle.model,
    modelYear: String(vehicle.modelYear),
    category: vehicle.category,

    trim: vehicle.trim ?? "",
    color: vehicle.color ?? "",
    transmission: vehicle.transmission,
    fuelType: vehicle.fuelType,

    seatCount: String(vehicle.seatCount),
    doorCount:
      vehicle.doorCount === null
        ? ""
        : String(vehicle.doorCount),
    hasAirConditioning: vehicle.hasAirConditioning ?? false,

    odometerKm: String(vehicle.odometerKm),
    currentLocationLabel: vehicle.currentLocationLabel ?? "",
    notes: vehicle.notes ?? "",

    dailyPrice: vehicle.dailyPrice,
    currency: vehicle.currency,
    depositAmount: vehicle.depositAmount ?? "",
    includedMileageKm:
      vehicle.includedMileageKm === null
        ? ""
        : String(vehicle.includedMileageKm),
    extraKmPrice: vehicle.extraKmPrice ?? "",
  };
}
