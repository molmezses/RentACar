
import { describe, expect, it, vi } from 'vitest';
import { NotFoundException } from '@nestjs/common';
import { TenantApplicationsService } from './tenant-applications.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';

describe('TenantApplicationsService - findOneForAdmin', () => {
  const application = {
    id: 'application-123',
    companyName: 'Example RentACar',
    slug: 'example-rentacar',
    contactName: 'Example User',
    contactEmail: 'example@example.com',
    contactPhone: '+905321234567',
    status: 'PENDING' as const,
    tenantId: null,
    createdAt: new Date('2026-11-06T10:00:00.000Z'),
    updatedAt: new Date('2026-11-06T10:00:00.000Z'),
  };

  function createService() {
    const findUnique = vi.fn();

    const prisma = {
      tenantApplication: {
        findUnique,
      },
    } as unknown as PrismaService;

    const service = new TenantApplicationsService(prisma);

    return { service, findUnique };
  }

  it('returns a tenant application when the ID exists', async () => {
    const { service, findUnique } = createService();

    findUnique.mockResolvedValue(application);

    const result = await service.findOneForAdmin(
      'application-123',
    );

    expect(result).toEqual(application);

    expect(findUnique).toHaveBeenCalledWith({
      where: {
        id: 'application-123',
      },
      select: {
        id: true,
        companyName: true,
        slug: true,
        contactName: true,
        contactEmail: true,
        contactPhone: true,
        status: true,
        tenantId: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  });

  it('throws NotFoundException when the ID does not exist', async () => {
    const { service, findUnique } = createService();

    findUnique.mockResolvedValue(null);

    await expect(
      service.findOneForAdmin('unknown-id'),
    ).rejects.toThrow(NotFoundException);
  });
});
