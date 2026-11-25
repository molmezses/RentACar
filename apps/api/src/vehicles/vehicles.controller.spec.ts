
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UnauthorizedException } from '@nestjs/common';

import { VehiclesController } from './vehicles.controller.js';
import { VehiclesService } from './vehicles.service.js';
import type { TenantAuthenticatedRequest } from '../auth/guards/tenant-jwt-auth.guard.js';
import { ListVehiclesQueryDto } from './dto/list-vehicles-query.dto.js';

vi.mock('../auth/tenant-auth-context.js', () => ({
  getTenantAuthContext: vi.fn((request) => {
    if (!request.tenantAuth) {
      throw new UnauthorizedException();
    }

    return request.tenantAuth;
  }),
}));

describe('VehiclesController', () => {
  const findAllForTenant = vi.fn();
  const findOneForTenant = vi.fn();
  const updateStatusForTenant = vi.fn();

  const service = {
    findAllForTenant,
    findOneForTenant,
    updateStatusForTenant,
  } as unknown as VehiclesService;

  const controller = new VehiclesController(service);

  const createRequest = (tenantId = 'tenant_a') =>
    ({
      tenantAuth: {
        tenantId,
      },
    }) as unknown as TenantAuthenticatedRequest;

  beforeEach(() => {
    vi.resetAllMocks();

    findAllForTenant.mockResolvedValue({
      items: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    });

    findOneForTenant.mockResolvedValue({
      id: 'vehicle_1',
      plate: '34 ABC 123',
    });

    updateStatusForTenant.mockResolvedValue({
      id: 'vehicle_1',
      fleetStatus: 'INACTIVE',
      deactivatedAt: '2026-11-25T17:00:00.000Z',
    });
  });

  it('listeleme için oturumdaki tenantId değerini kullanır', async () => {
    const request = createRequest('tenant_a');
    const query = new ListVehiclesQueryDto();

    await controller.findAll(request, query);

    expect(findAllForTenant).toHaveBeenCalledWith('tenant_a', query);
  });

  it('arama ve filtreleme parametrelerini Service’e aktarır', async () => {
    const request = createRequest('tenant_b');
    const query = Object.assign(new ListVehiclesQueryDto(), {
      page: 2,
      limit: 10,
      search: 'Toyota',
      category: 'SEDAN',
      sortBy: 'dailyPrice',
      sortOrder: 'asc',
    });

    await controller.findAll(request, query);

    expect(findAllForTenant).toHaveBeenCalledWith('tenant_b', query);
  });

  it('araç detayında tenantId ve vehicleId gönderir', async () => {
    const request = createRequest('tenant_a');

    await controller.findOne(request, 'vehicle_1');

    expect(findOneForTenant).toHaveBeenCalledWith(
      'tenant_a',
      'vehicle_1',
    );
  });

  it('Service sonucunu değiştirmeden döndürür', async () => {
    const request = createRequest();
    const query = new ListVehiclesQueryDto();

    const result = await controller.findAll(request, query);

    expect(result).toEqual({
      items: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
      },
    });
  });

  it('Tenant oturum bilgisi yoksa isteği reddeder', async () => {
    const request = {} as TenantAuthenticatedRequest;

    await expect(
      controller.findAll(request, new ListVehiclesQueryDto()),
    ).rejects.toThrow(UnauthorizedException);

    expect(findAllForTenant).not.toHaveBeenCalled();
  });


it('durum güncellemede tenantId değerini oturumdan alır', async () => {
  const request = createRequest('tenant_a');

  const body = {
    fleetStatus: 'INACTIVE' as const,
  };

  await controller.updateStatus(
    request,
    'vehicle_1',
    body,
  );

  expect(updateStatusForTenant).toHaveBeenCalledWith(
    'tenant_a',
    'vehicle_1',
    'INACTIVE',
  );
});


it('durum güncelleme sonucunu değiştirmeden döndürür', async () => {
  const request = createRequest('tenant_a');

  const body = {
    fleetStatus: 'INACTIVE' as const,
  };

  const result = await controller.updateStatus(
    request,
    'vehicle_1',
    body,
  );

  expect(result).toEqual({
    id: 'vehicle_1',
    fleetStatus: 'INACTIVE',
    deactivatedAt: '2026-11-25T17:00:00.000Z',
  });
});


it('durum güncellemede Tenant oturumu yoksa isteği reddeder', async () => {
  const request = {} as TenantAuthenticatedRequest;

  await expect(
    controller.updateStatus(
      request,
      'vehicle_1',
      { fleetStatus: 'INACTIVE' },
    ),
  ).rejects.toThrow(UnauthorizedException);

  expect(updateStatusForTenant).not.toHaveBeenCalled();
});

});
