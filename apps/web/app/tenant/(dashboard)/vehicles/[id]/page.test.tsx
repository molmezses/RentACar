// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  render,
  screen,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import TenantVehicleDetailPage from "./page";
import {
  fetchVehicleById,
  VehicleApiError,
} from "@/lib/vehicles/api";

import type { Vehicle } from "@/types/vehicle";

vi.mock("next/navigation", () => ({
  useParams: () => ({
    id: "vehicle-123",
  }),
}));

vi.mock("@/lib/vehicles/api", async (importOriginal) => {
  const actual =
    await importOriginal<typeof import("@/lib/vehicles/api")>();

  return {
    ...actual,
    fetchVehicleById: vi.fn(),
  };
});

afterEach(() => {
  cleanup();
  vi.resetAllMocks();
});

const vehicle: Omit<Vehicle, "tenantId"> = {
  id: "vehicle-123",
  plate: "38 ABC 123",
  make: "Toyota",
  model: "Corolla",
  modelYear: 2024,
  category: "SEDAN",
  trim: null,
  color: "Beyaz",
  vin: null,
  internalCode: null,
  transmission: "AUTOMATIC",
  fuelType: "PETROL",
  seatCount: 5,
  doorCount: 4,
  odometerKm: 25000,
  hasAirConditioning: true,
  dailyPrice: "1500.00",
  currency: "TRY",
  depositAmount: null,
  includedMileageKm: 200,
  extraKmPrice: null,
  fleetStatus: "ACTIVE",
  currentLocationLabel: null,
  notes: null,
  createdAt: "2026-11-27T10:00:00.000Z",
  updatedAt: "2026-11-27T10:00:00.000Z",
  deactivatedAt: null,
};

describe("TenantVehicleDetailPage", () => {
  it("araç bilgileri yüklendiğinde Düzenle bağlantısını gösterir", async () => {
    vi.mocked(fetchVehicleById).mockResolvedValue(vehicle);

    render(<TenantVehicleDetailPage />);

    expect(
      await screen.findByRole("heading", {
        name: "Toyota Corolla",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("link", {
        name: "Düzenle",
      }),
    ).toBeInTheDocument();
  });

  it("Düzenle bağlantısı doğru araç adresine yönlendirir", async () => {
  vi.mocked(fetchVehicleById).mockResolvedValue(vehicle);

  render(<TenantVehicleDetailPage />);

  const editLink = await screen.findByRole("link", {
    name: "Düzenle",
  });

  expect(editLink).toHaveAttribute(
    "href",
    "/tenant/vehicles/vehicle-123/edit",
  );
});

it("araç bulunamadığında Düzenle bağlantısını göstermez", async () => {
  vi.mocked(fetchVehicleById).mockRejectedValue(
    new VehicleApiError("Araç bulunamadı.", 404),
  );

  render(<TenantVehicleDetailPage />);

  expect(
    await screen.findByRole("heading", {
      name: "Araç bulunamadı",
    }),
  ).toBeInTheDocument();

  expect(
    screen.queryByRole("link", {
      name: "Düzenle",
    }),
  ).not.toBeInTheDocument();
});

});