-- CreateEnum
CREATE TYPE "VehicleCategory" AS ENUM ('ECONOMY', 'COMPACT', 'SEDAN', 'SUV', 'LUXURY', 'VAN', 'OTHER');

-- CreateEnum
CREATE TYPE "Transmission" AS ENUM ('MANUAL', 'AUTOMATIC');

-- CreateEnum
CREATE TYPE "FuelType" AS ENUM ('PETROL', 'DIESEL', 'HYBRID', 'ELECTRIC', 'LPG', 'OTHER');

-- CreateEnum
CREATE TYPE "VehicleCurrency" AS ENUM ('TRY', 'USD', 'EUR');

-- CreateEnum
CREATE TYPE "FleetStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "plate" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "modelYear" INTEGER NOT NULL,
    "category" "VehicleCategory" NOT NULL,
    "transmission" "Transmission" NOT NULL,
    "fuelType" "FuelType" NOT NULL,
    "seatCount" INTEGER NOT NULL,
    "odometerKm" INTEGER NOT NULL,
    "dailyPrice" DECIMAL(12,2) NOT NULL,
    "currency" "VehicleCurrency" NOT NULL,
    "depositAmount" DECIMAL(12,2),
    "includedMileageKm" INTEGER,
    "extraKmPrice" DECIMAL(12,2),
    "fleetStatus" "FleetStatus" NOT NULL DEFAULT 'ACTIVE',
    "color" TEXT,
    "vin" TEXT,
    "internalCode" TEXT,
    "trim" TEXT,
    "doorCount" INTEGER,
    "currentLocationLabel" TEXT,
    "notes" TEXT,
    "hasAirConditioning" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Vehicle_tenantId_fleetStatus_idx" ON "Vehicle"("tenantId", "fleetStatus");

-- CreateIndex
CREATE INDEX "Vehicle_tenantId_createdAt_idx" ON "Vehicle"("tenantId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Vehicle_tenantId_plate_key" ON "Vehicle"("tenantId", "plate");

-- AddForeignKey
ALTER TABLE "Vehicle" ADD CONSTRAINT "Vehicle_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
