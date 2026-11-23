
import { describe, expect, it } from 'vitest';
import { Prisma, type Vehicle } from '../../generated/prisma/client.js';

import { toTenantVehicleResponse } from './vehicle-response.mapper.js';

describe('toTenantVehicleResponse', () => {
  const createVehicle = (): Vehicle => ({
    id: 'vehicle_1',
    tenantId: 'tenant_1',
    plate: '34 ABC 123',
    make: 'Toyota',
    model: 'Corolla',
    modelYear: 2024,
    category: 'SEDAN',
    transmission: 'AUTOMATIC',
    fuelType: 'HYBRID',
    seatCount: 5,
    odometerKm: 45000,
    dailyPrice: new Prisma.Decimal('1500.00'),
    currency: 'TRY',
    depositAmount: new Prisma.Decimal('3000.00'),
    includedMileageKm: 200,
    extraKmPrice: new Prisma.Decimal('12.50'),
    fleetStatus: 'ACTIVE',
    color: null,
    vin: null,
    internalCode: null,
    trim: null,
    doorCount: null,
    currentLocationLabel: null,
    notes: null,
    hasAirConditioning: null,
    createdAt: new Date('2026-11-20T10:00:00.000Z'),
    updatedAt: new Date('2026-11-20T10:00:00.000Z'),
  });

  it('tenantId alanını API yanıtından çıkarır', () => {
    const result = toTenantVehicleResponse(createVehicle());

    expect(result).not.toHaveProperty('tenantId');
    expect(result.id).toBe('vehicle_1');
    expect(result.make).toBe('Toyota');
  });

  it('Decimal fiyatları iki ondalıklı string olarak döndürür', () => {
    const result = toTenantVehicleResponse(createVehicle());

    expect(result.dailyPrice).toBe('1500.00');
    expect(result.depositAmount).toBe('3000.00');
    expect(result.extraKmPrice).toBe('12.50');
  });

  it('opsiyonel fiyatlar null olduğunda null döndürür', () => {
    const vehicle = createVehicle();

    vehicle.depositAmount = null;
    vehicle.extraKmPrice = null;

    const result = toTenantVehicleResponse(vehicle);

    expect(result.depositAmount).toBeNull();
    expect(result.extraKmPrice).toBeNull();
  });

  it('nullable alanları korur', () => {
    const result = toTenantVehicleResponse(createVehicle());

    expect(result.color).toBeNull();
    expect(result.vin).toBeNull();
    expect(result.hasAirConditioning).toBeNull();
  });

  it('diğer araç bilgilerini korur', () => {
    const result = toTenantVehicleResponse(createVehicle());

    expect(result.plate).toBe('34 ABC 123');
    expect(result.category).toBe('SEDAN');
    expect(result.fleetStatus).toBe('ACTIVE');
    expect(result.createdAt).toBeInstanceOf(Date);
  });
});
