
import { randomUUID } from 'node:crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PrismaClient } from '../../generated/prisma/client.js';

const databaseUrl = process.env['TEST_DATABASE_URL'];

if (!databaseUrl) {
  throw new Error('TEST_DATABASE_URL is required for database tests.');
}

const parsedUrl = new URL(databaseUrl);

if (
  !['postgresql:', 'postgres:'].includes(parsedUrl.protocol) ||
  parsedUrl.pathname !== '/rentacar_test'
) {
  throw new Error(
    'Database tests must use the rentacar_test database.',
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

const suffix = randomUUID();
const tenantIdA = randomUUID();
const tenantIdB = randomUUID();
const adminId = randomUUID();
const activationTokenId = randomUUID();

const email = `c2-${suffix}@example.test`;
const tokenHash = randomUUID();

describe('Tenant Admin database constraints', () => {
  beforeAll(async () => {
    await prisma.$connect();

    await prisma.tenant.createMany({
      data: [
        {
          id: tenantIdA,
          name: 'C2 Test Company A',
          slug: `c2-company-a-${suffix}`,
          status: 'APPROVED',
        },
        {
          id: tenantIdB,
          name: 'C2 Test Company B',
          slug: `c2-company-b-${suffix}`,
          status: 'APPROVED',
        },
      ],
    });

    await prisma.tenantAdmin.create({
      data: {
        id: adminId,
        tenantId: tenantIdA,
        email,
      },
    });

    await prisma.tenantActivationToken.create({
      data: {
        id: activationTokenId,
        tenantAdminId: adminId,
        tokenHash,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      },
    });

    await prisma.invitationDelivery.create({
      data: {
        tenantAdminId: adminId,
        activationTokenId,
        recipientEmail: email,
        encryptedToken: 'test-placeholder-only',
      },
    });
  });

  afterAll(async () => {
    try {
      await prisma.invitationDelivery.deleteMany({
        where: { tenantAdminId: adminId },
      });

      await prisma.tenantActivationToken.deleteMany({
        where: { tenantAdminId: adminId },
      });

      await prisma.tenantAdmin.deleteMany({
        where: { id: adminId },
      });

      await prisma.tenant.deleteMany({
        where: { id: { in: [tenantIdA, tenantIdB] } },
      });
    } finally {
      await prisma.$disconnect();
    }
  });

  it('rejects multiple admins for the same tenant', async () => {
    await expect(
      prisma.tenantAdmin.create({
        data: {
          tenantId: tenantIdA,
          email: `other-${suffix}@example.test`,
        },
      }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  it('rejects duplicate administrator emails', async () => {
    await expect(
      prisma.tenantAdmin.create({
        data: {
          tenantId: tenantIdB,
          email,
        },
      }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  it('rejects administrators referencing missing tenants', async () => {
    await expect(
      prisma.tenantAdmin.create({
        data: {
          tenantId: randomUUID(),
          email: `missing-${suffix}@example.test`,
        },
      }),
    ).rejects.toMatchObject({ code: 'P2003' });
  });

  it('rejects duplicate activation token hashes', async () => {
    await expect(
      prisma.tenantActivationToken.create({
        data: {
          tenantAdminId: adminId,
          tokenHash,
          expiresAt: new Date(Date.now() + 60_000),
        },
      }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });

  it('rejects multiple deliveries for one activation token', async () => {
    await expect(
      prisma.invitationDelivery.create({
        data: {
          tenantAdminId: adminId,
          activationTokenId,
          recipientEmail: email,
        },
      }),
    ).rejects.toMatchObject({ code: 'P2002' });
  });
});
