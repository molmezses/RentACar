"use client";

import { useRouter } from "next/navigation";

import VehicleList from "@/components/vehicles/VehicleList";
import { mockVehicles } from "@/lib/vehicles/mock-data";

export default function TenantVehicleListClient() {
  const router = useRouter();

  return (
    <VehicleList
      vehicles={mockVehicles}
      onAdd={() => router.push("/tenant/vehicles/new")}
    />
  );
}