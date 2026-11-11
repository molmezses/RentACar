//VehicleCard bileşenini kullanarak araç verilerini dışarıdan alacak ve arama, filtreleme, sıralama işlemlerini yapacak.
"use client";

import { useMemo, useState } from "react";

import VehicleCard from "@/components/vehicles/VehicleCard";
import VehicleEmptyState from "@/components/vehicles/VehicleEmptyState";
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

  const activeCount = vehicles.filter(
    (vehicle) => vehicle.fleetStatus === "ACTIVE",
  ).length;

  function updateOption<K extends keyof VehicleListOptions>(
    key: K,
    value: VehicleListOptions[K],
  ) {
    setOptions((previous) => ({
      ...previous,
      [key]: value,
    }));
  }

  function resetFilters() {
    setOptions((previous) => ({
      ...defaultVehicleListOptions,
      sortBy: previous.sortBy,
    }));
  }

  const filterControls = (
    <div className="space-y-5">
      {/* Araç arama */}
      <div>
        <label
          htmlFor="vehicle-search"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Araç ara
        </label>

        <input
          id="vehicle-search"
          type="search"
          placeholder="Marka, model veya plaka"
          value={options.search}
          onChange={(event) =>
            updateOption("search", event.target.value)
          }
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-slate-400 focus:bg-white"
        />
      </div>

      {/* Filo durumu */}
      <div>
        <label
          htmlFor="vehicle-status-filter"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Filo durumu
        </label>

        <select
          id="vehicle-status-filter"
          value={options.fleetStatus}
          onChange={(event) =>
            updateOption(
              "fleetStatus",
              event.target.value as VehicleListOptions["fleetStatus"],
            )
          }
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900"
        >
          <option value="">Tüm araçlar</option>
          <option value="ACTIVE">Aktif</option>
          <option value="INACTIVE">Pasif</option>
        </select>
      </div>

      {/* Vites */}
      <div>
        <label
          htmlFor="vehicle-transmission-filter"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Vites türü
        </label>

        <select
          id="vehicle-transmission-filter"
          value={options.transmission}
          onChange={(event) =>
            updateOption(
              "transmission",
              event.target.value as VehicleListOptions["transmission"],
            )
          }
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900"
        >
          <option value="">Tüm vites türleri</option>
          <option value="MANUAL">Manuel</option>
          <option value="AUTOMATIC">Otomatik</option>
        </select>
      </div>

      {/* Yakıt */}
      <div>
        <label
          htmlFor="vehicle-fuel-filter"
          className="mb-2 block text-sm font-medium text-slate-700"
        >
          Yakıt türü
        </label>

        <select
          id="vehicle-fuel-filter"
          value={options.fuelType}
          onChange={(event) =>
            updateOption(
              "fuelType",
              event.target.value as VehicleListOptions["fuelType"],
            )
          }
          className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm text-slate-900"
        >
          <option value="">Tüm yakıt türleri</option>
          <option value="PETROL">Benzin</option>
          <option value="DIESEL">Dizel</option>
          <option value="HYBRID">Hibrit</option>
          <option value="ELECTRIC">Elektrik</option>
          <option value="LPG">LPG</option>
          <option value="OTHER">Diğer</option>
        </select>
      </div>

      {/* Filtreleri sıfırla */}
      <button
        type="button"
        onClick={resetFilters}
        disabled={!hasFilters}
        className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Filtreleri temizle
      </button>
    </div>
  );

  return (
    <section className="space-y-7">
      {/* Başlık ve sıralama */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">
            Araç Filosu
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Filonuzdaki araçları tek bir yerden görüntüleyin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label
            htmlFor="vehicle-sort"
            className="text-sm font-medium text-slate-600"
          >
            Sırala
          </label>

          <select
            id="vehicle-sort"
            value={options.sortBy}
            onChange={(event) =>
              updateOption(
                "sortBy",
                event.target.value as VehicleListOptions["sortBy"],
              )
            }
            className="max-w-56 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700"
          >
            <option value="newest">Model yılı (Yeni → Eski)</option>
            <option value="make">Marka (A → Z)</option>
            <option value="priceAsc">Fiyat (Artan)</option>
            <option value="priceDesc">Fiyat (Azalan)</option>
          </select>

          {onAdd && (
            <button
              type="button"
              onClick={onAdd}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
            >
              + Araç Ekle
            </button>
          )}
        </div>
      </header>

      {/* Filo istatistikleri */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Toplam araç</p>

          <p className="mt-2 text-3xl font-bold text-slate-900">
            {vehicles.length}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Aktif araç</p>

          <p className="mt-2 text-3xl font-bold text-emerald-600">
            {activeCount}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5">
          <p className="text-sm text-slate-500">Pasif araç</p>

          <p className="mt-2 text-3xl font-bold text-slate-500">
            {vehicles.length - activeCount}
          </p>
        </div>
      </div>

      {/* Mobil filtre butonu */}
      <button
        type="button"
        className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-800 lg:hidden"
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

      {/* Sidebar ve araç kartları */}
      <div className="grid items-start gap-6 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
        {/* Sol filtre paneli */}
        <aside
          id="vehicle-filter-panel"
          className={`rounded-2xl border border-slate-200 bg-white p-5 ${
            mobileFiltersOpen ? "block" : "hidden"
          } lg:block`}
          aria-label="Araç filtreleri"
        >
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">
              Filtreler
            </h2>

            {activeFilterCount > 0 && (
              <span className="rounded-full bg-slate-900 px-2 py-0.5 text-xs font-semibold text-white">
                {activeFilterCount}
              </span>
            )}
          </div>

          {filterControls}
        </aside>

        {/* Sağ araç listesi — sidebar ile aynı hizadan başlar */}
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
            <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
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
