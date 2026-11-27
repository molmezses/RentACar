import { VehicleApiError } from "./api";
import type { VehicleValidationErrors } from "./validation";
import type { VehicleFormValues } from "@/types/vehicle";

const fieldLabels: Record<keyof VehicleFormValues, string> = {
  plate: "Plaka",
  vin: "Şasi numarası",
  internalCode: "İç kod",
  make: "Marka",
  model: "Model",
  modelYear: "Model yılı",
  category: "Kategori",
  trim: "Donanım",
  color: "Renk",
  transmission: "Vites",
  fuelType: "Yakıt türü",
  seatCount: "Koltuk sayısı",
  doorCount: "Kapı sayısı",
  hasAirConditioning: "Klima durumu",
  odometerKm: "Kilometre",
  currentLocationLabel: "Araç konumu",
  notes: "İç notlar",
  dailyPrice: "Günlük fiyat",
  currency: "Para birimi",
  depositAmount: "Depozito",
  includedMileageKm: "Dahil kilometre",
  extraKmPrice: "Ek kilometre ücreti",
};

type VehicleFormApiErrors = {
  fieldErrors: VehicleValidationErrors;
  generalError: string | null;
};

export function mapVehicleApiErrors(
  error: VehicleApiError,
): VehicleFormApiErrors {
  const fieldErrors: VehicleValidationErrors = {};
  const generalMessages: string[] = [];

  if (error.status === 409) {
  const isDuplicatePlate = error.messages.some(
    (message) =>
      message ===
        "A vehicle with this identifier already exists in your fleet" ||
      message ===
        "A vehicle with the same unique information already exists.",
  );

  if (isDuplicatePlate) {
    return {
      fieldErrors: {
        plate: "Bu plaka filonuzda zaten kayıtlı.",
      },
      generalError: null,
    };
  }

  return {
    fieldErrors,
    generalError:
      "Araç bilgileri mevcut verilerle çakışıyor. Lütfen tekrar kontrol edin.",
  };
}

  if (error.status === 400) {
    for (const message of error.messages) {
      if (message === "Vehicle odometer cannot be decreased.") {
        fieldErrors.odometerKm =
          "Aracın kilometresi mevcut değerinden düşük olamaz.";

        continue;
      }

      const field = (
        Object.keys(fieldLabels) as Array<keyof VehicleFormValues>
      ).find((key) => message.startsWith(`${key} `));

      if (field) {
        fieldErrors[field] =
          `${fieldLabels[field]} bilgisi geçersiz.`;
      } else {
        generalMessages.push(message);
      }
    }

    return {
      fieldErrors,
      generalError: generalMessages.join(" ") || null,
    };
  }

  return {
    fieldErrors,
    generalError: error.message,
  };
}