
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';

import { VehiclesService } from './vehicles.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ListVehiclesQueryDto } from './dto/list-vehicles-query.dto.js';

describe('VehiclesService', () => {
  const findMany = vi.fn();
  const count = vi.fn();
  const findFirst = vi.fn();

  const prisma = {
    vehicle: {
      findMany,
      count,
      findFirst,
    },
  } as unknown as PrismaService;

  const service = new VehiclesService(prisma);

  const createQuery = (
    overrides: Partial<ListVehiclesQueryDto> = {},
  ): ListVehiclesQueryDto =>
    Object.assign(new ListVehiclesQueryDto(), overrides);

  const createVehicle = (tenantId = 'tenant_a') => ({
    id: 'vehicle_1',
    tenantId,
    plate: '34 ABC 123',
    make: 'Toyota',
    model: 'Corolla',
    modelYear: 2024,
    category: 'SEDAN' as const,
    transmission: 'AUTOMATIC' as const,
    fuelType: 'HYBRID' as const,
    seatCount: 5,
    odometerKm: 45000,
    dailyPrice: new Prisma.Decimal('1500.00'),
    currency: 'TRY' as const,
    depositAmount: null,
    includedMileageKm: null,
    extraKmPrice: null,
    fleetStatus: 'ACTIVE' as const,
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

  beforeEach(() => {
    vi.resetAllMocks();
    findMany.mockResolvedValue([]);
    count.mockResolvedValue(0);
    findFirst.mockResolvedValue(null);
  });

  describe('findAllForTenant', () => {
    it('varsayılan pagination değerlerini kullanır', async () => {
      const result = await service.findAllForTenant(
        'tenant_a',
        createQuery(),
      );

      expect(findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant_a' },
          skip: 0,
          take: 20,
          orderBy: [
            { createdAt: 'desc' },
            { id: 'asc' },
          ],
        }),
      );

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

    it('ikinci sayfa için doğru skip değerini hesaplar', async () => {
      await service.findAllForTenant(
        'tenant_a',
        createQuery({ page: 2, limit: 10 }),
      );

      expect(findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });

    it('toplam sayfa sayısını hesaplar', async () => {
      count.mockResolvedValue(45);

      const result = await service.findAllForTenant(
        'tenant_a',
        createQuery(),
      );

      expect(result.pagination).toEqual({
        page: 1,
        limit: 20,
        total: 45,
        totalPages: 3,
      });
    });

    it('arama koşulunu plaka, marka ve modele uygular', async () => {
      await service.findAllForTenant(
        'tenant_a',
        createQuery({ search: ' Toyota ' }),
      );

      const args = findMany.mock.calls[0][0];

      expect(args.where.tenantId).toBe('tenant_a');
      expect(args.where.OR).toEqual([
        {
          plate: {
            contains: 'Toyota',
            mode: 'insensitive',
          },
        },
        {
          make: {
            contains: 'Toyota',
            mode: 'insensitive',
          },
        },
        {
          model: {
            contains: 'Toyota',
            mode: 'insensitive',
          },
        },
      ]);
    });

    it('boş aramada OR koşulu eklemez', async () => {
      await service.findAllForTenant(
        'tenant_a',
        createQuery({ search: '   ' }),
      );

      expect(findMany.mock.calls[0][0].where).toEqual({
        tenantId: 'tenant_a',
      });
    });

    it('dört araç filtresini birlikte uygular', async () => {
      await service.findAllForTenant(
        'tenant_a',
        createQuery({
          category: 'SUV',
          fleetStatus: 'ACTIVE',
          transmission: 'AUTOMATIC',
          fuelType: 'DIESEL',
        }),
      );

      expect(findMany.mock.calls[0][0].where).toEqual({
        tenantId: 'tenant_a',
        category: 'SUV',
        fleetStatus: 'ACTIVE',
        transmission: 'AUTOMATIC',
        fuelType: 'DIESEL',
      });
    });

    it('arama ve filtreleme birlikte çalışır', async () => {
      await service.findAllForTenant(
        'tenant_a',
        createQuery({
          search: 'BMW',
          category: 'SUV',
        }),
      );

      const where = findMany.mock.calls[0][0].where;

      expect(where.tenantId).toBe('tenant_a');
      expect(where.category).toBe('SUV');
      expect(where.OR).toHaveLength(3);
    });

    it('dinamik sıralama uygular', async () => {
      await service.findAllForTenant(
        'tenant_a',
        createQuery({
          sortBy: 'dailyPrice',
          sortOrder: 'asc',
        }),
      );

      expect(findMany.mock.calls[0][0].orderBy).toEqual([
        { dailyPrice: 'asc' },
        { id: 'asc' },
      ]);
    });

    it('findMany ve count aynı filtreleri kullanır', async () => {
      await service.findAllForTenant(
        'tenant_a',
        createQuery({
          search: 'Toyota',
          fleetStatus: 'ACTIVE',
        }),
      );

      expect(findMany.mock.calls[0][0].where).toEqual(
        count.mock.calls[0][0].where,
      );
    });

    it('Tenant izolasyonunu sorguda uygular', async () => {
      await service.findAllForTenant(
        'tenant_b',
        createQuery({ search: 'Toyota' }),
      );

      expect(findMany.mock.calls[0][0].where.tenantId).toBe(
        'tenant_b',
      );

      expect(count.mock.calls[0][0].where.tenantId).toBe(
        'tenant_b',
      );
    });

    it('liste yanıtını mapper ile dönüştürür', async () => {
      findMany.mockResolvedValue([createVehicle()]);
      count.mockResolvedValue(1);

      const result = await service.findAllForTenant(
        'tenant_a',
        createQuery(),
      );

      expect(result.items).toHaveLength(1);
      expect(result.items[0]).not.toHaveProperty('tenantId');
      expect(result.items[0].dailyPrice).toBe('1500.00');
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('findOneForTenant', () => {
    it('araç detayını tenantId ve araç ID ile sorgular', async () => {
      findFirst.mockResolvedValue(createVehicle());

      const result = await service.findOneForTenant(
        'tenant_a',
        'vehicle_1',
      );

      expect(findFirst).toHaveBeenCalledWith({
        where: {
          id: 'vehicle_1',
          tenantId: 'tenant_a',
        },
      });

      expect(result.id).toBe('vehicle_1');
      expect(result).not.toHaveProperty('tenantId');
      expect(result.dailyPrice).toBe('1500.00');
    });

    it('araç bulunamadığında 404 hatası fırlatır', async () => {
      await expect(
        service.findOneForTenant('tenant_a', 'unknown_vehicle'),
      ).rejects.toThrow(NotFoundException);
    });

    it('başka Tenant aracına erişim için 404 davranışını korur', async () => {
      // Prisma mock'u tenantId koşuluna eşleşen kayıt bulamadığını simüle eder.
      findFirst.mockResolvedValue(null);

      await expect(
        service.findOneForTenant('tenant_a', 'vehicle_of_tenant_b'),
      ).rejects.toThrow('Vehicle not found');

      expect(findFirst.mock.calls[0][0].where).toEqual({
        id: 'vehicle_of_tenant_b',
        tenantId: 'tenant_a',
      });
    });
  });
});
