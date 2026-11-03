import { describe, expect, it, vi } from 'vitest';

import { PrismaService } from '../prisma/prisma.service.js';
import { TenantsService } from './tenants.service.js';

describe('TenantsService', () => {
  it('veritabanındaki tenant kayıtlarını listeler', async () => {
    const tenants = [
      {
        id: 'tenant-1',
        name: 'ABC Rent A Car',
        slug: 'abc-rentacar',
        status: 'APPROVED',
      },
    ];

    const findMany = vi.fn().mockResolvedValue(tenants);

    const prisma = {
      tenant: {
        findMany,
      },
    } as unknown as PrismaService;

    const service = new TenantsService(prisma);

    const result = await service.findAll();

    expect(findMany).toHaveBeenCalledOnce();
    expect(result).toEqual(tenants);
  });

  it('tenant bulunmadığında boş liste döndürür', async () => {
    const findMany = vi.fn().mockResolvedValue([]);

    const prisma = {
      tenant: {
        findMany,
      },
    } as unknown as PrismaService;

    const service = new TenantsService(prisma);

    const result = await service.findAll();

    expect(result).toEqual([]);
  });
});