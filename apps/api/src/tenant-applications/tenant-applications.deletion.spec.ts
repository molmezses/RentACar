import { beforeEach, describe, expect, it, vi } from 'vitest';

import { PrismaService } from '../prisma/prisma.service.js';
import { InvitationSecurityService } from '../invitation-security/invitation-security.service.js';
import { TenantApplicationsService } from './tenant-applications.service.js';
import { NotFoundException , ConflictException} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';

describe('TenantApplicationsService - Deletion', () => {
  let service: TenantApplicationsService;

  const deleteMany = vi.fn();
  const findUnique = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    const prisma = {
      tenantApplication: {
        deleteMany,
        findUnique,
      },
    } as unknown as PrismaService;

    const invitationSecurity = {} as InvitationSecurityService;

    service = new TenantApplicationsService(prisma, invitationSecurity);
  });

  it('PENDING ve tenant bağlantısı olmayan başvuruyu siler', async () => {
  const applicationId = 'application-123';

  deleteMany.mockResolvedValue({ count: 1 });

  await expect(
    service.deleteApplication(applicationId),
  ).resolves.toBeUndefined();

  expect(deleteMany).toHaveBeenCalledWith({
    where: {
      id: applicationId,
      status: {
        in: ['PENDING', 'REJECTED'],
      },
      tenantId: null,
    },
  });

  expect(findUnique).not.toHaveBeenCalled();
});

it('başvuru bulunamazsa 404 hatası verir', async () => {
  const applicationId = 'unknown-id';

  deleteMany.mockResolvedValue({ count: 0 });
  findUnique.mockResolvedValue(null);

  await expect(
    service.deleteApplication(applicationId),
  ).rejects.toBeInstanceOf(NotFoundException);

  expect(deleteMany).toHaveBeenCalledOnce();
  expect(findUnique).toHaveBeenCalledWith({
    where: { id: applicationId },
    select: { id: true },
  });
});

it('APPROVED başvuruyu silmez ve 409 hatası verir', async () => {
  const applicationId = 'application-123';

  deleteMany.mockResolvedValue({ count: 0 });

  findUnique.mockResolvedValue({
    id: applicationId,
    status: 'APPROVED',
    tenantId: 'tenant-456',
  });

  await expect(
    service.deleteApplication(applicationId),
  ).rejects.toBeInstanceOf(ConflictException);

  expect(deleteMany).toHaveBeenCalledWith({
    where: {
      id: applicationId,
      status: {
        in: ['PENDING', 'REJECTED'],
      },
      tenantId: null,
    },
  });

  expect(findUnique).toHaveBeenCalledOnce();
});

it('Tenant bağlantısı bulunan PENDING başvuruyu silmez', async () => {
  const applicationId = 'application-123';

  deleteMany.mockResolvedValue({ count: 0 });

  findUnique.mockResolvedValue({
    id: applicationId,
    status: 'PENDING',
    tenantId: 'tenant-456',
  });

  await expect(
    service.deleteApplication(applicationId),
  ).rejects.toBeInstanceOf(ConflictException);

  expect(deleteMany).toHaveBeenCalledWith({
    where: {
      id: applicationId,
      status: {
        in: ['PENDING', 'REJECTED'],
      },
      tenantId: null,
    },
  });

  expect(findUnique).toHaveBeenCalledOnce();
});

it('REJECTED ve tenant bağlantısı olmayan başvuruyu siler', async () => {
  const applicationId = 'rejected-application-123';

  deleteMany.mockResolvedValue({ count: 1 });

  await expect(
    service.deleteApplication(applicationId),
  ).resolves.toBeUndefined();

  expect(deleteMany).toHaveBeenCalledWith({
    where: {
      id: applicationId,
      status: {
        in: ['PENDING', 'REJECTED'],
      },
      tenantId: null,
    },
  });

  expect(findUnique).not.toHaveBeenCalled();
});

it('Prisma P2003 hatasını 409 Conflict olarak döndürür', async () => {
  const error = new Prisma.PrismaClientKnownRequestError(
    'Foreign key constraint failed',
    {
      code: 'P2003',
      clientVersion: '7.0.0',
    },
  );

  deleteMany.mockRejectedValue(error);

  await expect(
    service.deleteApplication('application-123'),
  ).rejects.toBeInstanceOf(ConflictException);

  expect(deleteMany).toHaveBeenCalledOnce();
  expect(findUnique).not.toHaveBeenCalled();
});
});