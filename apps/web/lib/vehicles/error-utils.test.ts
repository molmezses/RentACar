import { describe, expect, it } from "vitest";

import { VehicleApiError } from "./api";
import { mapVehicleApiErrors } from "./error-utils";
describe("mapVehicleApiErrors", () => {
  it("400 validasyon hatalarını ilgili alanlara eşleştirir", () => {
    const error = new VehicleApiError(
      "Validation failed",
      400,
      [
        "plate must be a string",
        "seatCount must be an integer number",
      ],
    );

    expect(mapVehicleApiErrors(error)).toEqual({
      fieldErrors: {
        plate: "Plaka bilgisi geçersiz.",
        seatCount: "Koltuk sayısı bilgisi geçersiz.",
      },
      generalError: null,
    });
  });

  it("kilometre azaltma hatasını kilometre alanına eşleştirir", () => {
    const error = new VehicleApiError(
      "Vehicle odometer cannot be decreased.",
      400,
    );

    expect(mapVehicleApiErrors(error)).toEqual({
      fieldErrors: {
        odometerKm:
          "Aracın kilometresi mevcut değerinden düşük olamaz.",
      },
      generalError: null,
    });
  });

  it("eşleştirilemeyen 400 hatasını genel hata olarak korur", () => {
    const error = new VehicleApiError(
      "Invalid vehicle data",
      400,
    );

    expect(mapVehicleApiErrors(error)).toEqual({
      fieldErrors: {},
      generalError: "Invalid vehicle data",
    });
  });

  it("alan bazlı ve genel hataları birlikte korur", () => {
    const error = new VehicleApiError(
      "Validation failed",
      400,
      [
        "dailyPrice must be a decimal number",
        "Invalid vehicle data",
      ],
    );

    expect(mapVehicleApiErrors(error)).toEqual({
      fieldErrors: {
        dailyPrice: "Günlük fiyat bilgisi geçersiz.",
      },
      generalError: "Invalid vehicle data",
    });
  });

  it("araç oluştururken duplicate plate hatasını eşleştirir", () => {
    const error = new VehicleApiError(
      "A vehicle with this identifier already exists in your fleet",
      409,
    );

    expect(mapVehicleApiErrors(error)).toEqual({
      fieldErrors: {
        plate: "Bu plaka filonuzda zaten kayıtlı.",
      },
      generalError: null,
    });
  });

  it("araç güncellerken duplicate plate hatasını eşleştirir", () => {
    const error = new VehicleApiError(
      "A vehicle with the same unique information already exists.",
      409,
    );

    expect(mapVehicleApiErrors(error)).toEqual({
      fieldErrors: {
        plate: "Bu plaka filonuzda zaten kayıtlı.",
      },
      generalError: null,
    });
  });

  it("diğer 409 hatalarını plaka hatasına dönüştürmez", () => {
    const error = new VehicleApiError(
      "Vehicle could not be updated because its data has changed.",
      409,
    );

    expect(mapVehicleApiErrors(error)).toEqual({
      fieldErrors: {},
      generalError:
        "Araç bilgileri mevcut verilerle çakışıyor. Lütfen tekrar kontrol edin.",
    });
  });

  it.each([401, 403, 404, 502, 0])(
    "%i durum kodunu genel hata olarak korur",
    (status) => {
      const error = new VehicleApiError(
        "API hatası",
        status,
      );

      expect(mapVehicleApiErrors(error)).toEqual({
        fieldErrors: {},
        generalError: "API hatası",
      });
    },
  );
});