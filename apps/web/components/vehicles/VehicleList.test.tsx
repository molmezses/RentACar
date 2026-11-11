
// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import VehicleList from "./VehicleList";
import { mockVehicles } from "@/lib/vehicles/mock-data";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("VehicleList", () => {
  it("renders vehicle cards", () => {
    render(<VehicleList vehicles={mockVehicles} />);

    expect(screen.getByText("Toyota Corolla")).toBeInTheDocument();
    expect(screen.getByText("Renault Clio")).toBeInTheDocument();
    expect(screen.getByText("38 ABC 123")).toBeInTheDocument();
  });

  it("shows the correct fleet status", () => {
    render(<VehicleList vehicles={mockVehicles} />);

    const toyotaCard = screen
      .getByText("Toyota Corolla")
      .closest("article");

    const renaultCard = screen
      .getByText("Renault Clio")
      .closest("article");

    expect(toyotaCard).not.toBeNull();
    expect(renaultCard).not.toBeNull();

    expect(
      within(toyotaCard!).getByText("Aktif"),
    ).toBeInTheDocument();

    expect(
      within(renaultCard!).getByText("Pasif"),
    ).toBeInTheDocument();
  });

  it("filters vehicles by search", () => {
    render(<VehicleList vehicles={mockVehicles} />);

    fireEvent.click(screen.getByRole("button", { name: "Filo durumu" }));
    fireEvent.click(screen.getByRole("button", { name: "Aktif" }));

    expect(screen.getByText("Toyota Corolla")).toBeInTheDocument();
    expect(screen.queryByText("Renault Clio")).not.toBeInTheDocument();
  });

  
it("filters vehicles by fleet status", () => {
  render(<VehicleList vehicles={mockVehicles} />);

  // Filtre menüsünü aç
  fireEvent.click(
    screen.getByRole("button", { name: "Filo durumu" }),
  );

  // Aktif seçeneğini seç
  fireEvent.click(
    screen.getByRole("button", { name: "Aktif" }),
  );

  // Yalnızca aktif araç kalmalı
  expect(screen.getByText("Toyota Corolla")).toBeInTheDocument();
  expect(screen.queryByText("Renault Clio")).not.toBeInTheDocument();
});


  it("shows an empty state when there are no vehicles", () => {
    render(<VehicleList vehicles={[]} />);

    expect(screen.getByText("Henüz araç eklenmedi")).toBeInTheDocument();
  });

  it("shows a no-results state when search finds nothing", () => {
    render(<VehicleList vehicles={mockVehicles} />);

    fireEvent.change(screen.getByLabelText("Araç ara"), {
      target: { value: "Ferrari" },
    });

    expect(screen.getByText("Araç bulunamadı")).toBeInTheDocument();
  });

  it("shows a loading state", () => {
    render(<VehicleList vehicles={[]} isLoading />);

    expect(screen.getByText("Araçlar yükleniyor...")).toBeInTheDocument();
  });

  it("shows an error state", () => {
    render(
      <VehicleList
        vehicles={[]}
        error="Araç listesi alınamadı."
      />,
    );

    expect(screen.getByText("Araç listesi alınamadı.")).toBeInTheDocument();
  });

  it("does not show unavailable actions", () => {
    render(<VehicleList vehicles={mockVehicles} />);

    expect(
      screen.queryByRole("button", { name: /araç ekle/i }),
    ).not.toBeInTheDocument();

    expect(
      screen.queryByRole("button", { name: "Detay" }),
    ).not.toBeInTheDocument();
  });

  it("passes the selected vehicle id to the callback", () => {
    const onView = vi.fn();

    render(<VehicleList vehicles={mockVehicles} onView={onView} />);

    const toyotaCard = screen
      .getByText("Toyota Corolla")
      .closest("article");

    expect(toyotaCard).not.toBeNull();

    fireEvent.click(
      within(toyotaCard!).getByRole("button", { name: "Detayları Gör" })
    );

    expect(onView).toHaveBeenCalledWith("mock-vehicle-1");
  });
});
