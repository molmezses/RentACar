import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PrismaService } from '../prisma/prisma.service.js';
import { TenantApplicationsService } from './tenant-applications.service.js';
import { InvitationSecurityService } from '../invitation-security/invitation-security.service.js';

describe('TenantApplicationsService - Admin Listing', () => {
  const findMany = vi.fn();

  const prisma = {
    tenantApplication: {
      findMany,
    },
  } as unknown as PrismaService;

  const invitationSecurity = {
    generateToken: () => 'test-token',
    hashToken: () => 'test-token-hash',
    encryptToken: () => 'encrypted-test-token',
  } as unknown as InvitationSecurityService;

  const service = new TenantApplicationsService(prisma, invitationSecurity);

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('başvuruları en yeniden eskiye doğru, en fazla 50 kayıt olarak getirir', async () => {
    const applications = [
      {
        id: 'application-2',
        companyName: 'B Rent A Car',
        status: 'PENDING',
      },
      {
        id: 'application-1',
        companyName: 'A Rent A Car',
        status: 'PENDING',
      },
    ];

    findMany.mockResolvedValue(applications);

    const result = await service.findAllForAdmin();

    expect(findMany).toHaveBeenCalledWith({
      orderBy: {
        createdAt: 'desc',
      },
      take: 50,
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

    expect(result).toEqual(applications);
  });

  it('status gönderildiğinde başvuruları filtreler', async () => {
    const applications = [
      {
        id: 'application-1',
        status: 'PENDING',
      },
    ];

    findMany.mockResolvedValue(applications);

    const result = await service.findAllForAdmin('PENDING');

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: 'PENDING',
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: 50,
      }),
    );

    expect(result).toEqual(applications);
  });

  it('başvuru bulunamadığında boş liste döndürür', async () => {
    findMany.mockResolvedValue([]);

    const result = await service.findAllForAdmin();

    expect(result).toEqual([]);
    expect(findMany).toHaveBeenCalledOnce();
  });
});
