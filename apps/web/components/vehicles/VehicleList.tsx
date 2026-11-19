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
  setOptions({ ...defaultVehicleListOptions });
}

  // Sol filtre paneli
  const filterControls = (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
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

      <VehicleFilterSelect
        label="Sıralama"
        value={options.sortBy}
        onChange={(value) =>
          updateOption(
            "sortBy",
            value as VehicleListOptions["sortBy"],
          )
        }
        options={[
          { value: "newest", label: "Model yılı (Yeni → Eski)" },
          { value: "make", label: "Marka (A → Z)" },
          { value: "priceAsc", label: "Fiyat (Artan)" },
          { value: "priceDesc", label: "Fiyat (Azalan)" },
        ]}
      />
    </div>
  );

  return (
    <section className="space-y-7">
      {/* Sayfa başlığı ve sıralama */}
      <header className="flex flex-wrap items-center justify-between gap-5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#172e26]">
            Araç Filosu
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Filonuzdaki araçları tek bir yerden görüntüleyin.
          </p>
        </div>

        <div className="flex flex-wrap items-end gap-3">
          {/* Gerçek ekran bağlandığında gösterilir */}
          {onAdd && (
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#17674c] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#12543d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#17674c]"            >
              Araç Ekle
            </button>
          )}
        </div>
      </header>
            
      {/* Filo durumu sekmeleri */}
      <div
        className="flex flex-wrap gap-2"
        role="group"
        aria-label="Filo durumuna göre filtrele"
      >
        {[
          { label: "Tümü", value: "", count: vehicles.length },
          { label: "Aktif", value: "ACTIVE", count: activeCount },
          { label: "Pasif", value: "INACTIVE", count: inactiveCount },
        ].map((tab) => {
          const isActive = options.fleetStatus === tab.value;

          return (
            <button
              key={tab.value}
              type="button"
              aria-pressed={isActive}
              onClick={() =>
                updateOption(
                  "fleetStatus",
                  tab.value as VehicleListOptions["fleetStatus"],
                )
              }
              className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 ${
                isActive
                  ? "border-emerald-200 bg-emerald-50 text-[#17674c]"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              {tab.label} · {tab.count}
            </button>
          );
        })}
      </div>

      {/* Araç arama */}
      <div className="relative">
        <label htmlFor="vehicle-search" className="sr-only">
          Araç, plaka veya model ara
        </label>

        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m16 16 4 4" />
        </svg>

        <input
          id="vehicle-search"
          type="search"
          placeholder="Araç, plaka veya model ara..."
          value={options.search}
          onChange={(event) =>
            updateOption("search", event.target.value)
          }
          className="w-full rounded-lg border border-slate-200 bg-white py-3.5 pl-12 pr-4 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      {/* Filtre panelini açma / kapatma */}
      <div className="flex items-center justify-between gap-3">
        <button
          type="button"
          aria-expanded={mobileFiltersOpen}
          aria-controls="vehicle-filter-panel"
          onClick={() =>
            setMobileFiltersOpen((previous) => !previous)
          }
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-[#13241f] transition-colors hover:border-emerald-300 hover:bg-emerald-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            className="h-4 w-4"
          >
            <path d="M4 7h16M7 12h10M10 17h4" />
          </svg>

          <span>
            Filtreler
            {activeFilterCount > 0 && ` (${activeFilterCount})`}
          </span>
        </button>

        <button
          type="button"
          onClick={resetFilters}
          disabled={
            !hasFilters &&
            options.sortBy === defaultVehicleListOptions.sortBy
          }
          className="text-sm font-medium text-[#17674c] hover:underline disabled:cursor-not-allowed disabled:opacity-40"
        >
          Filtreleri Temizle
        </button>
      </div>

      {/* Sol sidebar + sağ araç listesi */}
      {/* Filtre paneli */}
        <div className="space-y-5">        
        <aside
          id="vehicle-filter-panel"
          className={`rounded-lg border border-slate-200 bg-white p-5 ${
          mobileFiltersOpen ? "block" : "hidden"
          }`}
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
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
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
