"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import VehicleList from "@/components/vehicles/VehicleList";
import {
  fetchVehicles,
  VehicleApiError,
  type VehicleListQuery,
  type VehiclePagination,
} from "@/lib/vehicles/api";
import {
  defaultVehicleListOptions,
  type VehicleListOptions,
} from "@/lib/vehicles/list-utils";
import type { VehicleDisplayData } from "@/types/vehicle";

const QUERY_KEYS = [
  "search",
  "category",
  "fleetStatus",
  "transmission",
  "fuelType",
  "sortBy",
  "sortOrder",
  "page",
] as const;

function toApiQuery(
  options: VehicleListOptions,
  page: number,
): VehicleListQuery {
  const sort = {
    newest: { sortBy: "createdAt", sortOrder: "desc" },
    make: { sortBy: "make", sortOrder: "asc" },
    priceAsc: { sortBy: "dailyPrice", sortOrder: "asc" },
    priceDesc: { sortBy: "dailyPrice", sortOrder: "desc" },
  } as const;

  return {
    page,
    limit: 20,
    search: options.search.trim() || undefined,
    category: options.category || undefined,
    fleetStatus: options.fleetStatus || undefined,
    transmission: options.transmission || undefined,
    fuelType: options.fuelType || undefined,
    ...sort[options.sortBy],
  };
}

// URL'deki parametreleri güvenli filtre değerlerine dönüştür.Adres çubuğundaki filtreleri okur.
function readUrlState() {
  const params = new URLSearchParams(window.location.search);
  const options: VehicleListOptions = {
    ...defaultVehicleListOptions,
    search: params.get("search") ?? "",
  };

  const category = params.get("category");
  const categories = [
    "ECONOMY",
    "COMPACT",
    "SEDAN",
    "SUV",
    "LUXURY",
    "VAN",
    "OTHER",
  ] as const;

  if (categories.some((value) => value === category)) {
    options.category = category as VehicleListOptions["category"];
  }

  const fleetStatus = params.get("fleetStatus");

  if (fleetStatus === "ACTIVE" || fleetStatus === "INACTIVE") {
    options.fleetStatus = fleetStatus;
  }

  const transmission = params.get("transmission");

  if (transmission === "MANUAL" || transmission === "AUTOMATIC") {
    options.transmission = transmission;
  }

  const fuelType = params.get("fuelType");
  const fuelTypes = [
    "PETROL",
    "DIESEL",
    "HYBRID",
    "ELECTRIC",
    "LPG",
    "OTHER",
  ] as const;

  if (fuelTypes.some((value) => value === fuelType)) {
    options.fuelType = fuelType as VehicleListOptions["fuelType"];
  }

  const sortBy = params.get("sortBy");
  const sortOrder = params.get("sortOrder");

  if (sortBy === "make" && sortOrder === "asc") {
    options.sortBy = "make";
  } else if (sortBy === "dailyPrice" && sortOrder === "asc") {
    options.sortBy = "priceAsc";
  } else if (sortBy === "dailyPrice" && sortOrder === "desc") {
    options.sortBy = "priceDesc";
  }

  const rawPage = Number(params.get("page") ?? "1");
  const page = Number.isSafeInteger(rawPage) && rawPage >= 1 ? rawPage : 1;

  return { options, page };
}

// Filtreleri URL'ye yaz; varsayılanları URL'de tutma.
function writeUrlState(
  options: VehicleListOptions,
  page: number,
  mode: "push" | "replace" = "push",
) {
  const url = new URL(window.location.href);

  for (const key of QUERY_KEYS) {
    url.searchParams.delete(key);
  }

  const query = toApiQuery(options, page);

  if (query.search) url.searchParams.set("search", query.search);
  if (query.category) url.searchParams.set("category", query.category);
  if (query.fleetStatus) url.searchParams.set("fleetStatus", query.fleetStatus);
  if (query.transmission)
    url.searchParams.set("transmission", query.transmission);
  if (query.fuelType) url.searchParams.set("fuelType", query.fuelType);

  if (options.sortBy !== "newest") {
    url.searchParams.set("sortBy", query.sortBy!);
    url.searchParams.set("sortOrder", query.sortOrder!);
  }

  if (page > 1) {
    url.searchParams.set("page", String(page));
  }

  const nextUrl = `${url.pathname}${url.search}${url.hash}`;

  if (mode === "replace") {
    window.history.replaceState(null, "", nextUrl);
  } else {
    window.history.pushState(null, "", nextUrl);
  }
}

export default function TenantVehicleListClient() {
  const router = useRouter();

  const [ready, setReady] = useState(false);

  const [options, setOptions] = useState<VehicleListOptions>({
    ...defaultVehicleListOptions,
  });

  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<VehiclePagination | null>(null);
  const [vehicles, setVehicles] = useState<VehicleDisplayData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // İlk açılışta URL'deki filtreleri oku.
  // Geri/ileri tuşlarında da state'i URL'ye göre güncelle.
  useEffect(() => {
    function syncFromUrl() {
      const state = readUrlState();
      setOptions(state.options);
      setPage(state.page);
      setReady(true);
    }

    syncFromUrl();

    window.addEventListener("popstate", syncFromUrl);

    return () => {
      window.removeEventListener("popstate", syncFromUrl);
    };
  }, []);

  // Filtre veya sayfa değiştiğinde gerçek API'yi çağır.
  useEffect(() => {
    if (!ready) return;

    const controller = new AbortController();

    const timeoutId = window.setTimeout(async () => {
      // Yeni API isteği başlamadan önce durumları sıfırla.
      setIsLoading(true);
      setError(null);
      setPagination(null);

      try {
        const response = await fetchVehicles(
          toApiQuery(options, page),
          controller.signal,
        );

        if (controller.signal.aborted) return;

        setVehicles(response.items);
        setPagination(response.pagination);
      } catch (error) {
        if (controller.signal.aborted) return;

        if (error instanceof VehicleApiError && error.status === 401) {
          router.replace("/tenant/session");
          return;
        }

        if (error instanceof VehicleApiError && error.status === 403) {
          setError("Araçları görüntüleme yetkiniz bulunmuyor.");
          return;
        }

        setError(
          error instanceof Error
            ? error.message
            : "Araçlar yüklenirken bir hata oluştu.",
        );
      } finally {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      }
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
      controller.abort();
    };
  }, [options, page, ready, router]);

  function handleOptionsChange(nextOptions: VehicleListOptions) {
    // Arama yazarken tarayıcı geçmişine her harfi eklemeyelim.
    const mode = nextOptions.search !== options.search ? "replace" : "push";

    setOptions(nextOptions);
    setPage(1);
    writeUrlState(nextOptions, 1, mode);
  }

  function handlePageChange(nextPage: number) {
    setPage(nextPage);
    writeUrlState(options, nextPage);
  }

  return (
    <VehicleList
      vehicles={vehicles}
      isLoading={isLoading}
      error={error}
      serverMode
      options={options}
      pagination={pagination}
      onPageChange={handlePageChange}
      onOptionsChange={handleOptionsChange}
      onAdd={() => router.push("/tenant/vehicles/new")}
      onView={(id) => router.push(`/tenant/vehicles/${encodeURIComponent(id)}`)}
    />
  );
}
