import { ConflictException, NotFoundException } from '@nestjs/common';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PrismaService } from '../prisma/prisma.service.js';
import { TenantApplicationsService } from './tenant-applications.service.js';
import { InvitationSecurityService } from '../invitation-security/invitation-security.service.js';

describe('TenantApplicationsService - Rejection', () => {
  let service: TenantApplicationsService;

  const findUnique = vi.fn();
  const updateMany = vi.fn();
  const findUniqueOrThrow = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    const invitationSecurity = {
      generateToken: () => 'test-token',
      hashToken: () => 'test-token-hash',
      encryptToken: () => 'encrypted-test-token',
    } as unknown as InvitationSecurityService;

    const prisma = {
      tenantApplication: {
        findUnique,
        updateMany,
        findUniqueOrThrow,
      },
    } as unknown as PrismaService;

    service = new TenantApplicationsService(prisma, invitationSecurity);
  });

  it('PENDING başvuruyu REJECTED yapar', async () => {
    const application = {
      id: 'application-123',
      companyName: 'ABC Rent A Car',
      status: 'PENDING',
      tenantId: null,
    };

    const rejectedApplication = {
      ...application,
      status: 'REJECTED',
    };

    findUnique.mockResolvedValue(application);
    updateMany.mockResolvedValue({ count: 1 });
    findUniqueOrThrow.mockResolvedValue(rejectedApplication);

    const result = await service.rejectApplication(application.id);

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: application.id,
        status: 'PENDING',
        tenantId: null,
      },
      data: {
        status: 'REJECTED',
      },
    });

    expect(findUniqueOrThrow).toHaveBeenCalledWith({
      where: { id: application.id },
    });

    expect(result).toEqual(rejectedApplication);
  });

  it('başvuru bulunamazsa 404 hatası verir', async () => {
    findUnique.mockResolvedValue(null);

    await expect(
      service.rejectApplication('unknown-id'),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(updateMany).not.toHaveBeenCalled();
  });

  it('APPROVED başvuruyu reddetmez', async () => {
    findUnique.mockResolvedValue({
      id: 'application-123',
      status: 'APPROVED',
      tenantId: 'tenant-456',
    });

    await expect(
      service.rejectApplication('application-123'),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(updateMany).not.toHaveBeenCalled();
  });

  it('REJECTED başvuruyu tekrar reddetmez', async () => {
    findUnique.mockResolvedValue({
      id: 'application-123',
      status: 'REJECTED',
      tenantId: null,
    });

    await expect(
      service.rejectApplication('application-123'),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(updateMany).not.toHaveBeenCalled();
  });

  it('başvuru başka işlem tarafından güncellendiyse reddetmez', async () => {
    findUnique.mockResolvedValue({
      id: 'application-123',
      status: 'PENDING',
      tenantId: null,
    });

    updateMany.mockResolvedValue({ count: 0 });

    await expect(
      service.rejectApplication('application-123'),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(findUniqueOrThrow).not.toHaveBeenCalled();
  });
});
