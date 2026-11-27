
// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import VehicleList from "./VehicleList";
import { mockVehicles } from "@/lib/vehicles/mock-data";
import { defaultVehicleListOptions } from "@/lib/vehicles/list-utils";

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

    fireEvent.change(
      screen.getByRole("searchbox", {
        name: "Araç, plaka veya model ara",
      }),
      {
        target: { value: "Toyota" },
      },
    );

    expect(screen.getByText("Toyota Corolla")).toBeInTheDocument();
    expect(screen.queryByText("Renault Clio")).not.toBeInTheDocument();
  });

  it("filters vehicles by fleet status", () => {
    render(<VehicleList vehicles={mockVehicles} />);

    fireEvent.click(
      screen.getByRole("button", { name: /Aktif · 1/ }),
    );

    expect(screen.getByText("Toyota Corolla")).toBeInTheDocument();
    expect(screen.queryByText("Renault Clio")).not.toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: /Aktif · 1/ }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("shows an empty state when there are no vehicles", () => {
    render(<VehicleList vehicles={[]} />);

    expect(screen.getByText("Henüz araç eklenmedi")).toBeInTheDocument();
  });

  it("shows a no-results state when search finds nothing", () => {
    render(<VehicleList vehicles={mockVehicles} />);

    fireEvent.change(
      screen.getByRole("searchbox", {
        name: "Araç, plaka veya model ara",
      }),
      {
        target: { value: "Ferrari" },
      },
    );

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

    expect(
      screen.getByText("Araç listesi alınamadı."),
    ).toBeInTheDocument();
  });

  it("does not show unavailable actions", () => {
  render(<VehicleList vehicles={mockVehicles} />);

  expect(
    screen.queryByRole("button", { name: /araç ekle/i }),
  ).not.toBeInTheDocument();

  expect(
    screen.queryByRole("button", { name: "Araç Detayı" }),
  ).not.toBeInTheDocument();

  expect(
    screen.queryByRole("button", { name: "Düzenle" }),
  ).not.toBeInTheDocument();
});

  it("passes the selected vehicle id to the callback", () => {
    const onView = vi.fn();

    render(
      <VehicleList
        vehicles={mockVehicles}
        onView={onView}
      />,
    );

    const toyotaCard = screen
      .getByText("Toyota Corolla")
      .closest("article");

    expect(toyotaCard).not.toBeNull();

    fireEvent.click(
      within(toyotaCard!).getByRole("button", {
        name: "Araç Detayı",
      }),
    );

    expect(onView).toHaveBeenCalledWith("mock-vehicle-1");
  });

  it("passes the edited vehicle id to the onEdit callback", () => {
  const onEdit = vi.fn();
  const onView = vi.fn();

  render(
    <VehicleList
      vehicles={mockVehicles}
      onEdit={onEdit}
      onView={onView}
    />,
  );

  const toyotaCard = screen
    .getByText("Toyota Corolla")
    .closest("article");

  expect(toyotaCard).not.toBeNull();

  fireEvent.click(
    within(toyotaCard!).getByRole("button", {
      name: "Düzenle",
    }),
  );

  expect(onEdit).toHaveBeenCalledOnce();
  expect(onEdit).toHaveBeenCalledWith("mock-vehicle-1");
  expect(onView).not.toHaveBeenCalled();
});

  it("calls onAdd when the add vehicle button is clicked", () => {
    const onAdd = vi.fn();

    render(
      <VehicleList
        vehicles={mockVehicles}
        onAdd={onAdd}
      />,
    );

    fireEvent.click(
      screen.getByRole("button", { name: /araç ekle/i }),
    );

    expect(onAdd).toHaveBeenCalledOnce();
  });


it("does not filter API results locally in server mode", () => {
  render(
    <VehicleList
      vehicles={mockVehicles}
      serverMode
      options={{
        ...defaultVehicleListOptions,
        search: "Ferrari",
      }}
    />,
  );

  // API sonuçlarını frontend tekrar filtrelememeli.
  expect(screen.getByText("Toyota Corolla")).toBeInTheDocument();
  expect(screen.getByText("Renault Clio")).toBeInTheDocument();
});

it("notifies the parent when a filter changes in server mode", () => {
  const onOptionsChange = vi.fn();

  render(
    <VehicleList
      vehicles={[]}
      serverMode
      options={{ ...defaultVehicleListOptions }}
      onOptionsChange={onOptionsChange}
    />,
  );

  fireEvent.change(
    screen.getByRole("searchbox", {
      name: "Araç, plaka veya model ara",
    }),
    {
      target: { value: "Toyota" },
    },
  );

  expect(onOptionsChange).toHaveBeenCalledWith({
    ...defaultVehicleListOptions,
    search: "Toyota",
  });
});

it("uses API pagination to navigate between pages", () => {
  const onPageChange = vi.fn();

  render(
    <VehicleList
      vehicles={mockVehicles}
      serverMode
      options={{ ...defaultVehicleListOptions }}
      pagination={{
        page: 1,
        limit: 20,
        total: 35,
        totalPages: 2,
      }}
      onPageChange={onPageChange}
    />,
  );

  // İlk sayfadayız.
  expect(
    screen.getByRole("button", { name: "Önceki" }),
  ).toBeDisabled();

  // Sayfa numaraları görünmeli.
  expect(
    screen.getByRole("button", { name: "Sayfa 1" }),
  ).toHaveAttribute("aria-current", "page");

  expect(
    screen.getByRole("button", { name: "Sayfa 2" }),
  ).toBeEnabled();

  // Sonraki butonu ikinci sayfaya geçmeli.
  fireEvent.click(
    screen.getByRole("button", { name: "Sonraki" }),
  );

  expect(onPageChange).toHaveBeenCalledWith(2);

  // Kullanıcı doğrudan ikinci sayfaya da gidebilmeli.
  fireEvent.click(
    screen.getByRole("button", { name: "Sayfa 2" }),
  );

  expect(onPageChange).toHaveBeenLastCalledWith(2);

  // Eski tasarımdaki toplam araç metni artık bulunmamalı.
  expect(screen.queryByText(/Toplam 35 araç/)).not.toBeInTheDocument();
});


it("disables the next button on the last page", () => {
  const onPageChange = vi.fn();

  render(
    <VehicleList
      vehicles={mockVehicles}
      serverMode
      options={{ ...defaultVehicleListOptions }}
      pagination={{
        page: 2,
        limit: 20,
        total: 35,
        totalPages: 2,
      }}
      onPageChange={onPageChange}
    />,
  );

  expect(
    screen.getByRole("button", { name: "Sonraki" }),
  ).toBeDisabled();

  expect(
    screen.getByRole("button", { name: "Önceki" }),
  ).toBeEnabled();

  expect(
    screen.getByRole("button", { name: "Sayfa 2" }),
  ).toHaveAttribute("aria-current", "page");

  fireEvent.click(
    screen.getByRole("button", { name: "Önceki" }),
  );

  expect(onPageChange).toHaveBeenCalledWith(1);
});

});
