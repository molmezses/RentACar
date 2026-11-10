//Front tarafında bir aracın hangi özelliklere sahip olduğunu Typescripte tanıtıyoruz
export type FleetStatus = "ACTIVE" | "INACTIVE";

export type VehicleCategory =
  | "ECONOMY"
  | "COMPACT"
  | "SEDAN"
  | "SUV"
  | "LUXURY"
  | "VAN"
  | "OTHER";

export type Transmission = "MANUAL" | "AUTOMATIC";

export type FuelType =
  | "PETROL"
  | "DIESEL"
  | "HYBRID"
  | "ELECTRIC"
  | "LPG"
  | "OTHER";

export type VehicleCurrency = "TRY" | "USD" | "EUR";

// Parasal değerler decimal olarak yazılır
// Example: "1500.00"
export type DecimalString = string;

// Backend tarafından döndürülecek ortak araç alanları
export type Vehicle = {
  id: string;
  tenantId: string;

  plate: string;
  vin: string | null;
  internalCode: string | null;

  make: string;
  model: string;
  modelYear: number;
  category: VehicleCategory;
  trim: string | null;
  color: string | null;

  transmission: Transmission;
  fuelType: FuelType;
  seatCount: number;
  doorCount: number | null;
  hasAirConditioning: boolean | null;

  odometerKm: number;
  currentLocationLabel: string | null;
  notes: string | null;

  dailyPrice: DecimalString;
  currency: VehicleCurrency;
  depositAmount: DecimalString | null;
  includedMileageKm: number | null;
  extraKmPrice: DecimalString | null;

  fleetStatus: FleetStatus;
  deactivatedAt: string | null;

  createdAt: string;
  updatedAt: string;
};

// Bir araç oluşturulurken gönderilen veriler
// tenantId kasıtlı olarak hariç tutuldu
// Backend sahipliği authentication üzerinden belirler
export type CreateVehicleInput = {
  plate: string;
  make: string;
  model: string;
  modelYear: number;
  category: VehicleCategory;

  transmission: Transmission;
  fuelType: FuelType;
  seatCount: number;
  odometerKm: number;

  dailyPrice: DecimalString;
  currency: VehicleCurrency;

  vin?: string | null;
  internalCode?: string | null;
  trim?: string | null;
  color?: string | null;
  doorCount?: number | null;
  hasAirConditioning?: boolean | null;
  currentLocationLabel?: string | null;
  notes?: string | null;
  depositAmount?: DecimalString | null;
  includedMileageKm?: number | null;
  extraKmPrice?: DecimalString | null;
};

// Yalnızca düzenlenebilir araç özellikleri güncellenebilir.
// Filo durumu ayrı olarak yönetilir.
export type UpdateVehicleInput = Partial<CreateVehicleInput>;

export type UpdateVehicleStatusInput = {
  fleetStatus: FleetStatus;
};

// Form değerleri string çünkü HTML inputları başlangıçta
// provide text, including numeric and monetary fields.
export type VehicleFormValues = {
  plate: string;
  vin: string;
  internalCode: string;

  make: string;
  model: string;
  modelYear: string;
  category: VehicleCategory | "";

  trim: string;
  color: string;
  transmission: Transmission | "";
  fuelType: FuelType | "";

  seatCount: string;
  doorCount: string;
  hasAirConditioning: boolean;

  odometerKm: string;
  currentLocationLabel: string;
  notes: string;

  dailyPrice: string;
  currency: VehicleCurrency | "";
  depositAmount: string;
  includedMileageKm: string;
  extraKmPrice: string;
};

// Araç listeleme için isteğe bağlı filtreler.
export type VehicleListFilters = {
  search?: string;
  category?: VehicleCategory;
  fleetStatus?: FleetStatus;
  page?: number;
  limit?: number;
  sortBy?: "createdAt" | "make" | "model" | "plate";
  sortOrder?: "asc" | "desc";
};

// Arayüz, liste/kartlar için daha küçük bir veri yapısı kullanabilir.
export type VehicleDisplayData = Pick<
  Vehicle,
  | "id"
  | "plate"
  | "make"
  | "model"
  | "modelYear"
  | "category"
  | "transmission"
  | "fuelType"
  | "dailyPrice"
  | "currency"
  | "fleetStatus"
>;
