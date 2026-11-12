// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";

import VehicleForm from "./VehicleForm";

afterEach(() => {
  cleanup();
});

describe("VehicleForm", () => {
  it("yeni araç formunu boş açar", () => {
    render(<VehicleForm onSubmit={vi.fn()} />);

    expect(screen.getByLabelText(/Marka/)).toHaveValue("");
    expect(screen.getByLabelText(/Model yılı/)).toHaveValue("");
    expect(screen.getByLabelText(/Para birimi/)).toHaveValue("TRY");
  });

  it("düzenleme için başlangıç değerlerini doldurur", () => {
    render(
      <VehicleForm
        initialValues={{
          make: "Toyota",
          model: "Corolla",
          plate: "38ABC123",
          modelYear: "2023",
        }}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByLabelText(/Marka/)).toHaveValue("Toyota");
    expect(screen.getByLabelText(/^Model\s*\*?$/)).toHaveValue("Corolla");
    expect(screen.getByLabelText(/Plaka/)).toHaveValue("38ABC123");
    expect(screen.getByLabelText(/Model yılı/)).toHaveValue("2023");
  });

  it("zorunlu alanlar boşken gönderimi engeller", () => {
    const onSubmit = vi.fn();

    render(<VehicleForm onSubmit={onSubmit} />);

    fireEvent.click(screen.getByRole("button", { name: "Aracı Kaydet" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getAllByRole("alert").length).toBeGreaterThan(0);
  });

  it("geçerli form bilgilerini onSubmit ile gönderir", () => {
    const onSubmit = vi.fn();

    render(<VehicleForm onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/Marka/), {
      target: { value: "Toyota" },
    });
    fireEvent.change(screen.getByLabelText(/^Model\s*\*?$/), {
      target: { value: "Corolla" },
    });
    fireEvent.change(screen.getByLabelText(/Plaka/), {
      target: { value: "38abc123" },
    });
    fireEvent.change(screen.getByLabelText(/Model yılı/), {
      target: { value: "2023" },
    });
    fireEvent.change(screen.getByLabelText(/Kategori/), {
      target: { value: "SEDAN" },
    });
    fireEvent.change(screen.getByLabelText(/Vites/), {
      target: { value: "AUTOMATIC" },
    });
    fireEvent.change(screen.getByLabelText(/Yakıt türü/), {
      target: { value: "PETROL" },
    });
    fireEvent.change(screen.getByLabelText(/Koltuk sayısı/), {
      target: { value: "5" },
    });
    fireEvent.change(screen.getByLabelText(/Kilometre/), {
      target: { value: "25000" },
    });
    fireEvent.change(screen.getByLabelText(/Günlük fiyat/), {
      target: { value: "1500" },
    });

    fireEvent.click(screen.getByRole("button", { name: "Aracı Kaydet" }));

    expect(onSubmit).toHaveBeenCalledOnce();
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        make: "Toyota",
        model: "Corolla",
        plate: "38ABC123",
        modelYear: 2023,
        category: "SEDAN",
        transmission: "AUTOMATIC",
        fuelType: "PETROL",
        seatCount: 5,
        odometerKm: 25000,
        dailyPrice: "1500",
        currency: "TRY",
      }),
    );
  });
});
