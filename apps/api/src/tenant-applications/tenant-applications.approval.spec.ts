import { ConflictException, NotFoundException } from '@nestjs/common';

import { beforeEach, describe, expect, it, vi } from 'vitest';

import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { TenantApplicationsService } from './tenant-applications.service.js';

import { InvitationSecurityService } from '../invitation-security/invitation-security.service.js';

describe('TenantApplicationsService - Approval', () => {
  let service: TenantApplicationsService;

  const findUnique = vi.fn();
  const updateMany = vi.fn();
  const updateApplication = vi.fn();
  const createTenant = vi.fn();

  const createTenantAdmin = vi.fn();
  const createActivationToken = vi.fn();
  const createInvitationDelivery = vi.fn();

  const tx = {
    tenantApplication: {
      findUnique,
      updateMany,
      update: updateApplication,
    },
    tenant: {
      create: createTenant,
    },
    tenantAdmin: {
      create: createTenantAdmin,
    },
    tenantActivationToken: {
      create: createActivationToken,
    },
    invitationDelivery: {
      create: createInvitationDelivery,
    },
  };

  beforeEach(() => {
    vi.resetAllMocks();

    createTenantAdmin.mockResolvedValue({
      id: 'tenant-admin-789',
      tenantId: 'tenant-456',
      email: 'owner@example.com',
    });

    createActivationToken.mockResolvedValue({
      id: 'activation-token-123',
      tenantAdminId: 'tenant-admin-789',
      tokenHash: 'test-token-hash',
    });

    createInvitationDelivery.mockResolvedValue({
      id: 'invitation-delivery-123',
      status: 'PENDING',
    });

    const transaction = vi.fn(
      async (callback: (client: typeof tx) => Promise<unknown>) => callback(tx),
    );

    const prisma = {
      $transaction: transaction,
    } as unknown as PrismaService;

    const invitationSecurity = {
      generateToken: vi.fn().mockReturnValue('test-token'),
      hashToken: vi.fn().mockReturnValue('test-token-hash'),
      encryptToken: vi.fn().mockReturnValue('encrypted-test-token'),
    } as unknown as InvitationSecurityService;

    service = new TenantApplicationsService(prisma, invitationSecurity);
  });

  it('PENDING başvuruyu onaylar ve Tenant oluşturur', async () => {
    const application = {
      id: 'application-123',
      companyName: 'ABC Rent A Car',
      slug: 'abc-rentacar',
      contactEmail: 'Owner@Example.com',
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

    expect(createTenantAdmin).toHaveBeenCalledWith({
      data: {
        tenantId: tenant.id,
        email: 'owner@example.com',
      },
    });

    expect(createActivationToken).toHaveBeenCalledWith({
      data: {
        tenantAdminId: 'tenant-admin-789',
        tokenHash: 'test-token-hash',
        expiresAt: expect.any(Date),
      },
    });

    expect(createInvitationDelivery).toHaveBeenCalledWith({
      data: {
        tenantAdminId: 'tenant-admin-789',
        activationTokenId: 'activation-token-123',
        recipientEmail: 'owner@example.com',
        encryptedToken: 'encrypted-test-token',
        status: 'PENDING',
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
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '7.10.0',
        meta: {
          target: ['slug'],
        },
      }),
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
      contactEmail: 'Owner@Example.com',
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

    updateApplication.mockRejectedValue(new Error('Database update failed'));

    await expect(service.approveApplication('application-123')).rejects.toThrow(
      'Database update failed',
    );

    expect(createTenant).toHaveBeenCalledOnce();
    expect(updateApplication).toHaveBeenCalledOnce();
  });

  it('TenantAdmin e-postası kullanılıyorsa 409 hatası verir', async () => {
    findUnique.mockResolvedValue({
      id: 'application-123',
      companyName: 'ABC Rent A Car',
      slug: 'abc-rentacar',
      contactEmail: 'owner@example.com',
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

    createTenantAdmin.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError('Unique constraint failed', {
        code: 'P2002',
        clientVersion: '7.10.1',
        meta: {
          target: ['email'],
        },
      }),
    );

    await expect(service.approveApplication('application-123')).rejects.toThrow(
      'A tenant administrator with this email address already exists.',
    );

    expect(createActivationToken).not.toHaveBeenCalled();
    expect(createInvitationDelivery).not.toHaveBeenCalled();
    expect(updateApplication).not.toHaveBeenCalled();
  });

  it('InvitationDelivery oluşturulamazsa onaylama başarısız olur', async () => {
    findUnique.mockResolvedValue({
      id: 'application-123',
      companyName: 'ABC Rent A Car',
      slug: 'abc-rentacar',
      contactEmail: 'owner@example.com',
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

    createInvitationDelivery.mockRejectedValue(
      new Error('Outbox creation failed'),
    );

    await expect(service.approveApplication('application-123')).rejects.toThrow(
      'Outbox creation failed',
    );

    expect(createTenantAdmin).toHaveBeenCalledOnce();
    expect(createActivationToken).toHaveBeenCalledOnce();
    expect(createInvitationDelivery).toHaveBeenCalledOnce();

    expect(updateApplication).not.toHaveBeenCalled();
  });

  it('aktivasyon tokenını 24 saat geçerli oluşturur', async () => {
    const now = new Date('2026-11-09T12:00:00.000Z');

    vi.useFakeTimers();
    vi.setSystemTime(now);

    try {
      findUnique.mockResolvedValue({
        id: 'application-123',
        companyName: 'ABC Rent A Car',
        slug: 'abc-rentacar',
        contactEmail: 'owner@example.com',
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

      await service.approveApplication('application-123');

      expect(createActivationToken).toHaveBeenCalledWith({
        data: {
          tenantAdminId: 'tenant-admin-789',
          tokenHash: 'test-token-hash',
          expiresAt: new Date('2026-11-10T12:00:00.000Z'),
        },
      });
    } finally {
      vi.useRealTimers();
    }
  });

  it('başarılı onaylama yanıtında ham token döndürmez', async () => {
    const application = {
      id: 'application-123',
      companyName: 'ABC Rent A Car',
      slug: 'abc-rentacar',
      contactEmail: 'owner@example.com',
      status: 'PENDING',
      tenantId: null,
    };

    const tenant = {
      id: 'tenant-456',
      name: application.companyName,
      slug: application.slug,
      status: 'APPROVED',
    };

    findUnique.mockResolvedValue(application);
    updateMany.mockResolvedValue({ count: 1 });
    createTenant.mockResolvedValue(tenant);

    updateApplication.mockResolvedValue({
      ...application,
      status: 'APPROVED',
      tenantId: tenant.id,
    });

    const result = await service.approveApplication(application.id);
    const serialized = JSON.stringify(result);

    expect(serialized).not.toContain('test-token');
    expect(serialized).not.toContain('encrypted-test-token');

    expect(result).toHaveProperty('application');
    expect(result).toHaveProperty('tenant');
  });
});
