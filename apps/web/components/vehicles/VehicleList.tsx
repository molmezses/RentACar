//VehicleCard bileşenini kullanarak araç verilerini dışarıdan alacak ve arama, filtreleme, sıralama işlemlerini yapacak.

"use client";

import { useMemo, useState } from "react";

import VehicleCard from "@/components/vehicles/VehicleCard";
import VehicleEmptyState from "@/components/vehicles/VehicleEmptyState";
import VehicleFilterSelect from "@/components/vehicles/VehicleFilterSelect";
import ErrorState from "@/components/ui/error-state";
import LoadingState from "@/components/ui/loading-state";

import {
  defaultVehicleListOptions,
  filterAndSortVehicles,
  type VehicleListOptions,
} from "@/lib/vehicles/list-utils";

import type { VehicleDisplayData } from "@/types/vehicle";

type VehicleListProps = {
  vehicles: VehicleDisplayData[];
  isLoading?: boolean;
  error?: string | null;
  onView?: (id: string) => void;
  onAdd?: () => void;
};

export default function VehicleList({
  vehicles,
  isLoading = false,
  error = null,
  onView,
  onAdd,
}: VehicleListProps) {
  const [options, setOptions] = useState<VehicleListOptions>({
    ...defaultVehicleListOptions,
  });

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  // Arama, filtreleme ve sıralama
  const filteredVehicles = useMemo(
    () => filterAndSortVehicles(vehicles, options),
    [vehicles, options],
  );

  const hasFilters = Boolean(
    options.search.trim() ||
      options.fleetStatus ||
      options.transmission ||
      options.fuelType,
  );

  const activeFilterCount = [
    options.search.trim(),
    options.fleetStatus,
    options.transmission,
    options.fuelType,
  ].filter(Boolean).length;

  // Filo istatistikleri
  const activeCount = vehicles.filter(
    (vehicle) => vehicle.fleetStatus === "ACTIVE",
  ).length;

  const inactiveCount = vehicles.length - activeCount;

  // Filtre değerini güncelle
  function updateOption<K extends keyof VehicleListOptions>(
    key: K,
    value: VehicleListOptions[K],
  ) {
    setOptions((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  // Sıralamayı koruyarak filtreleri temizle
  function resetFilters() {
    setOptions((previous) => ({
      ...defaultVehicleListOptions,
      sortBy: previous.sortBy,
    }));
  }

  // Sol filtre paneli
  const filterControls = (
    <div className="space-y-5">
      {/* Araç arama */}
      <div>
        <label
          htmlFor="vehicle-search"
          className="mb-2 block text-sm font-semibold text-slate-700"
        >
          Araç ara
        </label>

        <div className="relative">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m16 16 4 4" />
          </svg>

          <input
            id="vehicle-search"
            type="search"
            placeholder="Marka, model veya plaka"
            value={options.search}
            onChange={(event) =>
              updateOption("search", event.target.value)
            }
            className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Filo durumu */}
      <VehicleFilterSelect
        label="Filo durumu"
        value={options.fleetStatus}
        onChange={(value) =>
          updateOption(
            "fleetStatus",
            value as VehicleListOptions["fleetStatus"],
          )
        }
        options={[
          { value: "", label: "Tüm araçlar" },
          { value: "ACTIVE", label: "Aktif" },
          { value: "INACTIVE", label: "Pasif" },
        ]}
      />

      {/* Vites türü */}
      <VehicleFilterSelect
        label="Vites türü"
        value={options.transmission}
        onChange={(value) =>
          updateOption(
            "transmission",
            value as VehicleListOptions["transmission"],
          )
        }
        options={[
          { value: "", label: "Tüm vites türleri" },
          { value: "MANUAL", label: "Manuel" },
          { value: "AUTOMATIC", label: "Otomatik" },
        ]}
      />

      {/* Yakıt türü */}
      <VehicleFilterSelect
        label="Yakıt türü"
        value={options.fuelType}
        onChange={(value) =>
          updateOption(
            "fuelType",
            value as VehicleListOptions["fuelType"],
          )
        }
        options={[
          { value: "", label: "Tüm yakıt türleri" },
          { value: "PETROL", label: "Benzin" },
          { value: "DIESEL", label: "Dizel" },
          { value: "HYBRID", label: "Hibrit" },
          { value: "ELECTRIC", label: "Elektrik" },
          { value: "LPG", label: "LPG" },
          { value: "OTHER", label: "Diğer" },
        ]}
      />

      {/* Filtreleri temizle */}
      <button
        type="button"
        onClick={resetFilters}
        disabled={!hasFilters}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Filtreleri temizle
      </button>
    </div>
  );

  return (
    <section className="space-y-7">
      {/* Sayfa başlığı ve sıralama */}
      <header className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Araç Filosu
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Filonuzdaki araçları tek bir yerden görüntüleyin.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          {/* Modern sıralama dropdown */}
          <div className="w-60 max-w-full">
            <VehicleFilterSelect
              label="Sırala"
              value={options.sortBy}
              onChange={(value) =>
                updateOption(
                  "sortBy",
                  value as VehicleListOptions["sortBy"],
                )
              }
              options={[
                {
                  value: "newest",
                  label: "Model yılı (Yeni → Eski)",
                },
                {
                  value: "make",
                  label: "Marka (A → Z)",
                },
                {
                  value: "priceAsc",
                  label: "Fiyat (Artan)",
                },
                {
                  value: "priceDesc",
                  label: "Fiyat (Azalan)",
                },
              ]}
            />
          </div>

          {/* Gerçek ekran bağlandığında gösterilir */}
          {onAdd && (
            <button
              type="button"
              onClick={onAdd}
              className="rounded-xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              + Araç Ekle
            </button>
          )}
        </div>
      </header>

      {/* Filo istatistikleri */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {/* Toplam araç */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-slate-500">
              Toplam araç
            </p>

            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                aria-hidden="true"
                className="h-5 w-5"
              >
                <path d="M5 17h14l1-6-3-5H7l-3 5 1 6Z" />
                <path d="M4 11h16M7 17v2m10-2v2" />
                <circle cx="7.5" cy="14" r=".8" />
                <circle cx="16.5" cy="14" r=".8" />
              </svg>
            </span>
          </div>

          <p className="mt-3 text-3xl font-extrabold text-slate-900">
            {vehicles.length}
          </p>
        </div>

        {/* Aktif araç */}
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-emerald-800">
              Aktif araç
            </p>

            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
                className="h-5 w-5"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="m8 12 3 3 5-6" />
              </svg>
            </span>
          </div>

          <p className="mt-3 text-3xl font-extrabold text-emerald-800">
            {activeCount}
          </p>
        </div>

        {/* Pasif araç */}
        <div className="rounded-2xl border border-rose-200 bg-rose-50/70 p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-semibold text-rose-800">
              Pasif araç
            </p>

            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 text-rose-700">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                aria-hidden="true"
                className="h-5 w-5"
              >
                <circle cx="12" cy="12" r="9" />
                <path d="M8 12h8" />
              </svg>
            </span>
          </div>

          <p className="mt-3 text-3xl font-extrabold text-rose-800">
            {inactiveCount}
          </p>
        </div>
      </div>

      {/* Mobil filtre açma butonu */}
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 shadow-sm lg:hidden"
        aria-expanded={mobileFiltersOpen}
        aria-controls="vehicle-filter-panel"
        onClick={() =>
          setMobileFiltersOpen((previous) => !previous)
        }
      >
        <span>
          Filtreler
          {activeFilterCount > 0 && ` (${activeFilterCount})`}
        </span>

        <span aria-hidden="true">
          {mobileFiltersOpen ? "−" : "+"}
        </span>
      </button>

      {/* Sol sidebar + sağ araç listesi */}
      <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
        {/* Filtre paneli */}
        <aside
          id="vehicle-filter-panel"
          className={`rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ${
            mobileFiltersOpen ? "block" : "hidden"
          } lg:block`}
          aria-label="Araç filtreleri"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Filtreler
            </h2>

            {activeFilterCount > 0 && (
              <span className="rounded-full bg-blue-600 px-2.5 py-1 text-xs font-bold text-white">
                {activeFilterCount}
              </span>
            )}
          </div>

          {filterControls}
        </aside>

        {/* Araç kartları */}
        <div className="min-w-0">
          {isLoading ? (
            <LoadingState message="Araçlar yükleniyor..." />
          ) : error ? (
            <ErrorState
              title="Araçlar görüntülenemedi"
              message={error}
            />
          ) : filteredVehicles.length === 0 ? (
            <VehicleEmptyState hasFilters={hasFilters} />
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {filteredVehicles.map((vehicle) => (
                <VehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  onSelect={onView}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
