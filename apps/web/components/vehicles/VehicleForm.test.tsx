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

  it("klima bilgisi belirtilmediğinde null gönderir", () => {
    const onSubmit = vi.fn();

    render(
      <VehicleForm
        onSubmit={onSubmit}
        initialValues={{
          make: "Toyota",
          model: "Corolla",
          plate: "38ABC123",
          modelYear: "2023",
          category: "SEDAN",
          transmission: "AUTOMATIC",
          fuelType: "PETROL",
          seatCount: "5",
          odometerKm: "25000",
          dailyPrice: "1500",
        }}
      />,
    );

    expect(screen.getByRole("combobox", { name: /Klima durumu/i })).toHaveValue("");

    fireEvent.click(
      screen.getByRole("button", { name: "Aracı Kaydet" }),
    );

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        hasAirConditioning: null,
      }),
    );
  });

  it("klima var seçildiğinde true gönderir", () => {
    const onSubmit = vi.fn();

    render(
      <VehicleForm
        onSubmit={onSubmit}
        initialValues={{
          make: "Toyota",
          model: "Corolla",
          plate: "38ABC123",
          modelYear: "2023",
          category: "SEDAN",
          transmission: "AUTOMATIC",
          fuelType: "PETROL",
          seatCount: "5",
          odometerKm: "25000",
          dailyPrice: "1500",
        }}
      />,
    );

    fireEvent.change(screen.getByRole("combobox", { name: /Klima durumu/i }), {
      target: { value: "true" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Aracı Kaydet" }),
    );

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        hasAirConditioning: true,
      }),
    );
  });

  it("klima yok seçildiğinde false gönderir", () => {
    const onSubmit = vi.fn();

    render(
      <VehicleForm
        onSubmit={onSubmit}
        initialValues={{
          make: "Toyota",
          model: "Corolla",
          plate: "38ABC123",
          modelYear: "2023",
          category: "SEDAN",
          transmission: "AUTOMATIC",
          fuelType: "PETROL",
          seatCount: "5",
          odometerKm: "25000",
          dailyPrice: "1500",
        }}
      />,
    );

    fireEvent.change(screen.getByRole("combobox", { name: /Klima durumu/i }), {
      target: { value: "false" },
    });

    fireEvent.click(
      screen.getByRole("button", { name: "Aracı Kaydet" }),
    );

    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        hasAirConditioning: false,
      }),
    );
  });


it("form gönderildiğinde ilk hatalı alana odaklanır", () => {
  const onSubmit = vi.fn();

  render(<VehicleForm onSubmit={onSubmit} />);

  fireEvent.click(
    screen.getByRole("button", { name: "Aracı Kaydet" }),
  );

  const makeInput = screen.getByRole("textbox", {
    name: /Marka/i,
  });

  expect(makeInput).toHaveFocus();
  expect(onSubmit).not.toHaveBeenCalled();
});

it("değişiklik yapılmadığında iptal uyarısı göstermez", () => {
  const onCancel = vi.fn();
  const confirmSpy = vi.spyOn(window, "confirm");

  render(<VehicleForm onSubmit={vi.fn()} onCancel={onCancel} />);

  fireEvent.click(
    screen.getByRole("button", { name: "İptal" }),
  );

  expect(confirmSpy).not.toHaveBeenCalled();
  expect(onCancel).toHaveBeenCalledOnce();

  confirmSpy.mockRestore();
});

it("kaydedilmemiş değişiklik varsa çıkışı onaylatır", () => {
  const onCancel = vi.fn();
  const confirmSpy = vi
    .spyOn(window, "confirm")
    .mockReturnValue(false);

  render(<VehicleForm onSubmit={vi.fn()} onCancel={onCancel} />);

  fireEvent.change(
    screen.getByRole("textbox", { name: /Marka/i }),
    { target: { value: "Toyota" } },
  );

  fireEvent.click(
    screen.getByRole("button", { name: "İptal" }),
  );

  expect(confirmSpy).toHaveBeenCalledOnce();
  expect(onCancel).not.toHaveBeenCalled();

  confirmSpy.mockReturnValue(true);

  fireEvent.click(
    screen.getByRole("button", { name: "İptal" }),
  );

  expect(onCancel).toHaveBeenCalledOnce();

  confirmSpy.mockRestore();
});
it("backend plaka hatasını ilgili alanda gösterir", () => {
  render(
    <VehicleForm
      onSubmit={vi.fn()}
      serverErrors={{
        plate: "Bu plaka filonuzda zaten kayıtlı.",
      }}
    />,
  );

  const plateInput = screen.getByLabelText(/Plaka/);

  expect(
    screen.getByText("Bu plaka filonuzda zaten kayıtlı."),
  ).toBeInTheDocument();

  expect(plateInput).toHaveAttribute("aria-invalid", "true");

  expect(plateInput).toHaveAccessibleDescription(
    "Bu plaka filonuzda zaten kayıtlı.",
  );
});

it("backend klima hatasını ilgili alanda gösterir", () => {
  render(
    <VehicleForm
      onSubmit={vi.fn()}
      serverErrors={{
        hasAirConditioning: "Klima durumu bilgisi geçersiz.",
      }}
    />,
  );

  const input = screen.getByLabelText(/Klima durumu/);

  expect(input).toHaveAttribute("aria-invalid", "true");

  expect(input).toHaveAccessibleDescription(
    "Klima durumu bilgisi geçersiz.",
  );
});
it("backend iç notlar hatasını ilgili alanda gösterir", () => {
  render(
    <VehicleForm
      onSubmit={vi.fn()}
      serverErrors={{
        notes: "İç notlar bilgisi geçersiz.",
      }}
    />,
  );

  const input = screen.getByLabelText(/İç notlar/);

  expect(input).toHaveAttribute("aria-invalid", "true");

  expect(input).toHaveAccessibleDescription(
    "İç notlar bilgisi geçersiz.",
  );
});
it("alan değiştiğinde onFieldChange callbackini çağırır", () => {
  const onFieldChange = vi.fn();

  render(
    <VehicleForm
      onSubmit={vi.fn()}
      onFieldChange={onFieldChange}
      serverErrors={{
        plate: "Bu plaka filonuzda zaten kayıtlı.",
      }}
    />,
  );

  fireEvent.change(screen.getByLabelText(/Plaka/), {
    target: { value: "38ABC456" },
  });

  expect(onFieldChange).toHaveBeenCalledOnce();
  expect(onFieldChange).toHaveBeenCalledWith("plate");
});

it("backend hatası temizlendiğinde ilgili hata mesajını kaldırır", () => {
  const onSubmit = vi.fn();

  const { rerender } = render(
    <VehicleForm
      onSubmit={onSubmit}
      serverErrors={{
        plate: "Bu plaka filonuzda zaten kayıtlı.",
        dailyPrice: "Günlük fiyat bilgisi geçersiz.",
      }}
    />,
  );

  rerender(
    <VehicleForm
      onSubmit={onSubmit}
      serverErrors={{
        dailyPrice: "Günlük fiyat bilgisi geçersiz.",
      }}
    />,
  );

  expect(
    screen.queryByText("Bu plaka filonuzda zaten kayıtlı."),
  ).not.toBeInTheDocument();

  expect(
    screen.getByText("Günlük fiyat bilgisi geçersiz."),
  ).toBeInTheDocument();

  expect(
    screen.getByLabelText(/Plaka/),
  ).toHaveAttribute("aria-invalid", "false");
});
it("frontend validasyon hatasına öncelik verir", () => {
  const onSubmit = vi.fn();

  render(
    <VehicleForm
      onSubmit={onSubmit}
      serverErrors={{
        plate: "Bu plaka filonuzda zaten kayıtlı.",
      }}
    />,
  );

  fireEvent.click(
    screen.getByRole("button", { name: "Aracı Kaydet" }),
  );

  expect(
    screen.getByText("Plaka alanı zorunludur."),
  ).toBeInTheDocument();

  expect(
    screen.queryByText("Bu plaka filonuzda zaten kayıtlı."),
  ).not.toBeInTheDocument();

  expect(onSubmit).not.toHaveBeenCalled();
});
it("istek devam ederken form alanlarını ve butonları kilitler", () => {
  const { container } = render(
    <VehicleForm
      onSubmit={vi.fn()}
      onCancel={vi.fn()}
      isSubmitting
    />,
  );

  const controls = container.querySelectorAll(
    "input, select, textarea, button",
  );

  expect(controls.length).toBeGreaterThan(0);

  controls.forEach((control) => {
    expect(control).toBeDisabled();
  });

  expect(
    screen.getByRole("button", { name: "İşleniyor..." }),
  ).toBeDisabled();

  expect(
    screen.getByRole("button", { name: "İptal" }),
  ).toBeDisabled();
});
it("istek devam ederken formun tekrar gönderilmesini engeller", () => {
  const onSubmit = vi.fn();

  const { container } = render(
    <VehicleForm
      onSubmit={onSubmit}
      isSubmitting
      initialValues={{
        make: "Toyota",
        model: "Corolla",
        plate: "38ABC123",
        modelYear: "2023",
        category: "SEDAN",
        transmission: "AUTOMATIC",
        fuelType: "PETROL",
        seatCount: "5",
        odometerKm: "25000",
        dailyPrice: "1500",
      }}
    />,
  );

  const form = container.querySelector("form");

  expect(form).not.toBeNull();

  fireEvent.submit(form!);

  expect(onSubmit).not.toHaveBeenCalled();
});
});
