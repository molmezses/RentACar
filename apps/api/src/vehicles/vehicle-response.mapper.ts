import type { Vehicle } from '../../generated/prisma/client.js';

export function toTenantVehicleResponse(vehicle: Vehicle) {
  const { tenantId: _tenantId, ...publicVehicle } = vehicle;

  return {
    ...publicVehicle,
    dailyPrice: vehicle.dailyPrice.toFixed(2),
    depositAmount: vehicle.depositAmount?.toFixed(2) ?? null,
    extraKmPrice: vehicle.extraKmPrice?.toFixed(2) ?? null,
    deactivatedAt:vehicle.deactivatedAt?.toISOString() ?? null,
  };
}