
import {
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest';
import { BadRequestException } from '@nestjs/common';
import * as argon2 from 'argon2';

import { TenantAdminActivationService } from './tenant-admin-activation.service.js';
import type { PrismaService } from '../prisma/prisma.service.js';
import type { InvitationSecurityService } from '../invitation-security/invitation-security.service.js';

describe('Tenant Admin activation security', () => {
  const token = 'valid-test-activation-token';
  const tokenHash = 'test-token-sha256-hash';
  const password = 'SecurePassword123!';

  const tx = {
    tenantActivationToken: {
      findUnique: vi.fn(),
      updateMany: vi.fn(),
    },
    tenantAdmin: {
      updateMany: vi.fn(),
    },
  };

  const prisma = {
    $transaction: vi.fn(),
  };

  const invitationSecurity = {
    hashToken: vi.fn(),
  };

  const service = new TenantAdminActivationService(
    prisma as unknown as PrismaService,
    invitationSecurity as unknown as InvitationSecurityService,
  );

  const dto = { token, password };

  beforeEach(() => {
    vi.resetAllMocks();

    invitationSecurity.hashToken.mockReturnValue(tokenHash);

    prisma.$transaction.mockImplementation(
      async (
        callback: (client: typeof tx) => Promise<unknown>,
      ) => callback(tx),
    );

    tx.tenantActivationToken.findUnique.mockResolvedValue({
      id: 'activation-1',
      tenantAdminId: 'admin-1',
    });

    tx.tenantActivationToken.updateMany.mockResolvedValue({
      count: 1,
    });

    tx.tenantAdmin.updateMany.mockResolvedValue({
      count: 1,
    });
  });

  it('geçerli davet tokenı ile hesabı etkinleştirmeli', async () => {
    const result = await service.activate(dto);

    expect(result.message).toContain('etkinleştirildi');

    expect(invitationSecurity.hashToken).toHaveBeenCalledWith(
      token,
    );

    expect(
      tx.tenantActivationToken.findUnique,
    ).toHaveBeenCalledWith({
      where: { tokenHash },
      select: {
        id: true,
        tenantAdminId: true,
      },
    });

    expect(
      tx.tenantActivationToken.updateMany,
    ).toHaveBeenCalledWith({
      where: {
        id: 'activation-1',
        consumedAt: null,
        expiresAt: { gt: expect.any(Date) },
      },
      data: {
        consumedAt: expect.any(Date),
      },
    });

    expect(tx.tenantAdmin.updateMany).toHaveBeenCalledWith({
      where: {
        id: 'admin-1',
        activatedAt: null,
        disabledAt: null,
        passwordHash: null,
      },
      data: {
        passwordHash: expect.any(String),
        activatedAt: expect.any(Date),
        emailVerifiedAt: expect.any(Date),
      },
    });

    const updateArguments =
      tx.tenantAdmin.updateMany.mock.calls[0][0];

    expect(
      await argon2.verify(
        updateArguments.data.passwordHash,
        password,
      ),
    ).toBe(true);
  });

  it('geçersiz davet tokenını reddetmeli', async () => {
    tx.tenantActivationToken.findUnique.mockResolvedValue(
      null,
    );

    await expect(
      service.activate(dto),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(
      tx.tenantActivationToken.updateMany,
    ).not.toHaveBeenCalled();

    expect(
      tx.tenantAdmin.updateMany,
    ).not.toHaveBeenCalled();
  });

  it('süresi dolmuş token için aktivasyonu reddetmeli', async () => {
    // Veritabanının expiresAt koşulunu sağlamadığı durum.
    tx.tenantActivationToken.updateMany.mockResolvedValue({
      count: 0,
    });

    await expect(
      service.activate(dto),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(
      tx.tenantActivationToken.updateMany,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          expiresAt: { gt: expect.any(Date) },
        }),
      }),
    );

    expect(
      tx.tenantAdmin.updateMany,
    ).not.toHaveBeenCalled();
  });

  it('daha önce tüketilmiş tokenı reddetmeli', async () => {
    // consumedAt null değilse koşullu güncelleme 0 kayıt bulur.
    tx.tenantActivationToken.updateMany.mockResolvedValue({
      count: 0,
    });

    await expect(
      service.activate(dto),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(
      tx.tenantActivationToken.updateMany,
    ).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          consumedAt: null,
        }),
      }),
    );
  });

  it('aktif veya devre dışı bırakılmış hesabı tekrar etkinleştirmemeli', async () => {
    // Yönetici artık aktivasyon koşullarını karşılamıyor.
    tx.tenantAdmin.updateMany.mockResolvedValue({
      count: 0,
    });

    await expect(
      service.activate(dto),
    ).rejects.toBeInstanceOf(BadRequestException);

    expect(tx.tenantAdmin.updateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: 'admin-1',
          activatedAt: null,
          disabledAt: null,
          passwordHash: null,
        },
      }),
    );
  });

  it('eşzamanlı iki aktivasyon girişiminden yalnızca birini kabul etmeli', async () => {
    // İlk token claim başarılı, ikincisi başarısız.
    tx.tenantActivationToken.updateMany
      .mockResolvedValueOnce({ count: 1 })
      .mockResolvedValueOnce({ count: 0 });

    const results = await Promise.allSettled([
      service.activate(dto),
      service.activate(dto),
    ]);

    const successful = results.filter(
      (result) => result.status === 'fulfilled',
    );

    const failed = results.filter(
      (result) => result.status === 'rejected',
    );

    expect(successful).toHaveLength(1);
    expect(failed).toHaveLength(1);

    expect(
      tx.tenantAdmin.updateMany,
    ).toHaveBeenCalledTimes(1);
  });
});
