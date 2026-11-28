//Veritabanından veya api den gelen araç bilgilerini,düzenleme formunun anlayacağı biçime dönüştürüyoruz
import type {
  Vehicle,
  VehicleFormValues,
  CreateVehicleInput,
  UpdateVehicleInput,
} from "@/types/vehicle";

//Mevcut araç verisini düzenleme formuna uygun hale getirir
export function vehicleToFormValues(
 vehicle: Omit<Vehicle, "tenantId">,
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
    hasAirConditioning: vehicle.hasAirConditioning,

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

function optionalText(value: string): string | null {
  return value.trim() || null;
}

function optionalNumber(value: string): number | null {
  return value.trim() ? Number(value) : null;
}

//Formdan gelen verileri API ye göndrilmeye hazır hale getiryior, yani dönüştürüyor
export function formValuesToCreateInput(
  values: VehicleFormValues,
): CreateVehicleInput {
  return {
    plate: values.plate.trim().toUpperCase(),
    make: values.make.trim(),
    model: values.model.trim(),
    modelYear: Number(values.modelYear),
    category: values.category as CreateVehicleInput["category"],

    transmission: values.transmission as CreateVehicleInput["transmission"],
    fuelType: values.fuelType as CreateVehicleInput["fuelType"],
    seatCount: Number(values.seatCount),
    odometerKm: Number(values.odometerKm),

    dailyPrice: values.dailyPrice.trim(),
    currency: values.currency as CreateVehicleInput["currency"],

    vin: optionalText(values.vin),
    internalCode: optionalText(values.internalCode),
    trim: optionalText(values.trim),
    color: optionalText(values.color),

    doorCount: optionalNumber(values.doorCount),
    hasAirConditioning: values.hasAirConditioning,

    currentLocationLabel: optionalText(values.currentLocationLabel),
    notes: optionalText(values.notes),

    depositAmount: optionalText(values.depositAmount),
    includedMileageKm: optionalNumber(values.includedMileageKm),
    extraKmPrice: optionalText(values.extraKmPrice),
  };
}

// Yalnızca değiştirilen araç alanlarını PATCH isteğine hazırlar.
export function getVehicleUpdateInput(
  initial: CreateVehicleInput,
  current: CreateVehicleInput,
): UpdateVehicleInput {
  return Object.fromEntries(
    Object.entries(current).filter(
      ([key, value]) =>
        value !== undefined &&
        value !== initial[key as keyof CreateVehicleInput],
    ),
  ) as UpdateVehicleInput;
}