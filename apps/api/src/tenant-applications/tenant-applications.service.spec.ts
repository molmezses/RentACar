import { describe, expect, it, vi } from 'vitest';
import { TenantApplicationsService } from './tenant-applications.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('TenantApplicationsService', () => {
  it('should create a pending tenant application', async () => {
    const createMock = vi.fn().mockResolvedValue({
      id: 'application-123',
      status: 'PENDING',
    });

    const prismaMock = {
      tenantApplication: {
        create: createMock,
      },
    } as unknown as PrismaService;

    const service = new TenantApplicationsService(prismaMock);

    const dto = {
      companyName: 'Ankara RentACar',
      slug: 'ankara-rentacar',
      contactName: 'Test Yetkilisi',
      contactEmail: 'test@example.com',
      contactPhone: '+905321234567',
    };

    const result = await service.create(dto);

    expect(createMock).toHaveBeenCalledWith({
      data: {
        companyName: dto.companyName,
        slug: dto.slug,
        contactName: dto.contactName,
        contactEmail: dto.contactEmail,
        contactPhone: dto.contactPhone,
      },
    });

    expect(result.status).toBe('PENDING');
  });
});