import {
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';

import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { TenantApplicationsService } from './tenant-applications.service.js';

describe('TenantApplicationsService - Approval', () => {
  let service: TenantApplicationsService;

  const findUnique = vi.fn();
  const updateMany = vi.fn();
  const updateApplication = vi.fn();
  const createTenant = vi.fn();

  const tx = {
    tenantApplication: {
      findUnique,
      updateMany,
      update: updateApplication,
    },
    tenant: {
      create: createTenant,
    },
  };

  beforeEach(() => {
    vi.resetAllMocks();

    const transaction = vi.fn(
      async (
        callback: (client: typeof tx) => Promise<unknown>,
      ) => callback(tx),
    );

    const prisma = {
      $transaction: transaction,
    } as unknown as PrismaService;

    service = new TenantApplicationsService(prisma);
  });

  it('PENDING başvuruyu onaylar ve Tenant oluşturur', async () => {
    const application = {
      id: 'application-123',
      companyName: 'ABC Rent A Car',
      slug: 'abc-rentacar',
      status: 'PENDING',
      tenantId: null,
    };

    const tenant = {
      id: 'tenant-456',
      name: 'ABC Rent A Car',
      slug: 'abc-rentacar',
      status: 'APPROVED',
    };

    const approvedApplication = {
      ...application,
      status: 'APPROVED',
      tenantId: tenant.id,
    };

    findUnique.mockResolvedValue(application);
    updateMany.mockResolvedValue({ count: 1 });
    createTenant.mockResolvedValue(tenant);
    updateApplication.mockResolvedValue(approvedApplication);

    const result = await service.approveApplication(application.id);

    expect(updateMany).toHaveBeenCalledWith({
      where: {
        id: application.id,
        status: 'PENDING',
        tenantId: null,
      },
      data: {
        status: 'APPROVED',
      },
    });

    expect(createTenant).toHaveBeenCalledWith({
      data: {
        name: application.companyName,
        slug: application.slug,
        status: 'APPROVED',
      },
    });

    expect(updateApplication).toHaveBeenCalledWith({
      where: {
        id: application.id,
      },
      data: {
        tenantId: tenant.id,
      },
    });

    expect(result).toEqual({
      application: approvedApplication,
      tenant,
    });
  });

  it('başvuru bulunamazsa 404 hatası verir', async () => {
    findUnique.mockResolvedValue(null);

    await expect(
      service.approveApplication('non-existing-id'),
    ).rejects.toBeInstanceOf(NotFoundException);

    expect(createTenant).not.toHaveBeenCalled();
  });

  it('daha önce işlenmiş başvuruyu tekrar onaylamaz', async () => {
    findUnique.mockResolvedValue({
      id: 'application-123',
      companyName: 'ABC Rent A Car',
      slug: 'abc-rentacar',
      status: 'APPROVED',
      tenantId: 'tenant-456',
    });

    await expect(
      service.approveApplication('application-123'),
    ).rejects.toBeInstanceOf(ConflictException);

    expect(updateMany).not.toHaveBeenCalled();
    expect(createTenant).not.toHaveBeenCalled();
  });

  it('başvuru başka işlem tarafından güncellendiyse onaylamaz', async () => {
  findUnique.mockResolvedValue({
    id: 'application-123',
    companyName: 'ABC Rent A Car',
    slug: 'abc-rentacar',
    status: 'PENDING',
    tenantId: null,
  });

  updateMany.mockResolvedValue({ count: 0 });

  await expect(
    service.approveApplication('application-123'),
  ).rejects.toBeInstanceOf(ConflictException);

  expect(createTenant).not.toHaveBeenCalled();
  expect(updateApplication).not.toHaveBeenCalled();
});

it('Tenant slug değeri kullanılıyorsa 409 hatası verir', async () => {
  findUnique.mockResolvedValue({
    id: 'application-123',
    companyName: 'ABC Rent A Car',
    slug: 'abc-rentacar',
    status: 'PENDING',
    tenantId: null,
  });

  updateMany.mockResolvedValue({ count: 1 });

  createTenant.mockRejectedValue(
    new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        code: 'P2002',
        clientVersion: '7.10.0',
        meta: {
          target: ['slug'],
        },
      },
    ),
  );

  await expect(
    service.approveApplication('application-123'),
  ).rejects.toBeInstanceOf(ConflictException);

  expect(updateApplication).not.toHaveBeenCalled();
});

it('başvuru ilişkilendirilirken hata oluşursa işlemi başarısız sayar', async () => {
  findUnique.mockResolvedValue({
    id: 'application-123',
    companyName: 'ABC Rent A Car',
    slug: 'abc-rentacar',
    status: 'PENDING',
    tenantId: null,
  });

  updateMany.mockResolvedValue({ count: 1 });

  createTenant.mockResolvedValue({
    id: 'tenant-456',
    name: 'ABC Rent A Car',
    slug: 'abc-rentacar',
    status: 'APPROVED',
  });

  updateApplication.mockRejectedValue(
    new Error('Database update failed'),
  );

  await expect(
    service.approveApplication('application-123'),
  ).rejects.toThrow('Database update failed');

  expect(createTenant).toHaveBeenCalledOnce();
  expect(updateApplication).toHaveBeenCalledOnce();
});
});