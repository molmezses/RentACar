import { randomBytes, randomUUID } from 'node:crypto';

import { ConflictException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { PrismaClient } from '../../generated/prisma/client.js';
import { InvitationSecurityService } from '../../src/invitation-security/invitation-security.service.js';
import { PrismaService } from '../../src/prisma/prisma.service.js';
import { TenantApplicationsService } from '../../src/tenant-applications/tenant-applications.service.js';

// Never fall back to the development database.
const databaseUrl = process.env['TEST_DATABASE_URL'];

if (!databaseUrl) {
  throw new Error('TEST_DATABASE_URL is required for integration tests.');
}

const parsedUrl = new URL(databaseUrl);

if (
  !['postgres:', 'postgresql:'].includes(parsedUrl.protocol) ||
  !['localhost', '127.0.0.1'].includes(parsedUrl.hostname) ||
  parsedUrl.pathname !== '/rentacar_test'
) {
  throw new Error(
    'Integration tests must use the local rentacar_test database.',
  );
}

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: databaseUrl,
  }),
});

// A unique identifier prevents fixture collisions between test runs.
const suffix = randomUUID();

const existingTenantId = randomUUID();
const applicationId = randomUUID();

const existingTenantSlug = `c3-existing-${suffix}`;
const rejectedTenantSlug = `c3-rejected-${suffix}`;

const existingEmail = `c3-owner-${suffix}@example.test`;

const successfulApplicationId = randomUUID();

const successfulTenantSlug = `c3-success-${suffix}`;

const successfulEmail = `c3-success-${suffix}@example.test`;

// Use an isolated test key rather than the real .env encryption key.
const configService = {
  getOrThrow: (name: string) => {
    if (name === 'TENANT_INVITATION_ENCRYPTION_KEY') {
      return randomBytes(32).toString('hex');
    }

    throw new Error(`Unexpected config key: ${name}`);
  },
} as ConfigService;

const invitationSecurity = new InvitationSecurityService(configService);

const service = new TenantApplicationsService(
  prisma as unknown as PrismaService,
  invitationSecurity,
);

describe('C3 - Tenant invitation transaction', () => {
  beforeAll(async () => {
    await prisma.$connect();

    // Existing company with a registered administrator.
    await prisma.tenant.create({
      data: {
        id: existingTenantId,
        name: 'Existing C3 Test Company',
        slug: existingTenantSlug,
        status: 'APPROVED',
      },
    });

    await prisma.tenantAdmin.create({
      data: {
        tenantId: existingTenantId,
        email: existingEmail,
      },
    });

    // New application uses the same administrator email.
    await prisma.tenantApplication.create({
      data: {
        id: applicationId,
        companyName: 'Rejected C3 Test Company',
        slug: rejectedTenantSlug,
        contactName: 'C3 Test Owner',
        contactEmail: existingEmail,
        contactPhone: '+900000000000',
      },
    });

    await prisma.tenantApplication.create({
      data: {
        id: successfulApplicationId,
        companyName: 'Successful C3 Test Company',
        slug: successfulTenantSlug,
        contactName: 'Successful Test Owner',
        contactEmail: successfulEmail,
        contactPhone: '+900000000001',
      },
    });
  });

  afterAll(async () => {
    try {
      // Clean up only records belonging to this test run.
      await prisma.tenantApplication.deleteMany({
        where: { id: applicationId },
      });

      await prisma.tenantAdmin.deleteMany({
        where: { tenantId: existingTenantId },
      });

      await prisma.tenant.deleteMany({
        where: {
          id: existingTenantId,
        },
      });

      // Clean up the successful approval test fixtures first.
      const successfulTenant = await prisma.tenant.findUnique({
        where: { slug: successfulTenantSlug },
      });

      if (successfulTenant) {
        const administrator = await prisma.tenantAdmin.findUnique({
          where: { tenantId: successfulTenant.id },
        });

        // Remove the application relation before removing the tenant.
        await prisma.tenantApplication.deleteMany({
          where: { id: successfulApplicationId },
        });

        if (administrator) {
          // Respect foreign key dependencies.
          await prisma.invitationDelivery.deleteMany({
            where: { tenantAdminId: administrator.id },
          });

          await prisma.tenantActivationToken.deleteMany({
            where: { tenantAdminId: administrator.id },
          });

          await prisma.tenantAdmin.delete({
            where: { id: administrator.id },
          });
        }

        await prisma.tenant.delete({
          where: { id: successfulTenant.id },
        });
      } else {
        // The approval may have failed before creating a tenant.
        await prisma.tenantApplication.deleteMany({
          where: { id: successfulApplicationId },
        });
      }
    } finally {
      await prisma.$disconnect();
    }
  });

  it('rolls back tenant approval when administrator email is already used', async () => {
    await expect(
      service.approveApplication(applicationId),
    ).rejects.toBeInstanceOf(ConflictException);

    // The original application must remain pending.
    const application = await prisma.tenantApplication.findUniqueOrThrow({
      where: { id: applicationId },
    });

    expect(application.status).toBe('PENDING');
    expect(application.tenantId).toBeNull();

    // No new tenant should remain after rollback.
    const rejectedTenant = await prisma.tenant.findUnique({
      where: { slug: rejectedTenantSlug },
    });

    expect(rejectedTenant).toBeNull();

    // The original administrator must still exist.
    const existingAdmin = await prisma.tenantAdmin.findUnique({
      where: { email: existingEmail },
    });

    expect(existingAdmin).not.toBeNull();
    expect(existingAdmin?.tenantId).toBe(existingTenantId);
  });

  it('creates tenant, administrator, activation token and outbox atomically', async () => {
    const startedAt = Date.now();

    // 1. Approve the real application.
    const result = await service.approveApplication(successfulApplicationId);

    const finishedAt = Date.now();

    // 2. Verify the application was approved.
    expect(result.application.status).toBe('APPROVED');
    expect(result.application.tenantId).toBe(result.tenant.id);

    const application = await prisma.tenantApplication.findUniqueOrThrow({
      where: { id: successfulApplicationId },
    });

    expect(application.status).toBe('APPROVED');
    expect(application.tenantId).toBe(result.tenant.id);

    // 3. Verify the tenant exists.
    const tenant = await prisma.tenant.findUniqueOrThrow({
      where: { slug: successfulTenantSlug },
    });

    expect(tenant.id).toBe(result.tenant.id);
    expect(tenant.status).toBe('APPROVED');

    // 4. Verify the administrator exists but is not activated.
    const administrator = await prisma.tenantAdmin.findUniqueOrThrow({
      where: { tenantId: tenant.id },
    });

    expect(administrator.email).toBe(successfulEmail);
    expect(administrator.passwordHash).toBeNull();
    expect(administrator.activatedAt).toBeNull();
    expect(administrator.emailVerifiedAt).toBeNull();

    // 5. Verify the activation token.
    const activationTokens = await prisma.tenantActivationToken.findMany({
      where: { tenantAdminId: administrator.id },
    });

    expect(activationTokens).toHaveLength(1);

    const activationToken = activationTokens[0];

    expect(activationToken.tokenHash).toMatch(/^[a-f0-9]{64}$/);
    expect(activationToken.consumedAt).toBeNull();

    // The expiration must be 24 hours after issuance.
    const expiresAt = activationToken.expiresAt.getTime();
    const duration = 24 * 60 * 60 * 1000;

    expect(expiresAt).toBeGreaterThanOrEqual(startedAt + duration);
    expect(expiresAt).toBeLessThanOrEqual(finishedAt + duration);

    // 6. Verify the invitation outbox record.
    const deliveries = await prisma.invitationDelivery.findMany({
      where: { tenantAdminId: administrator.id },
    });

    expect(deliveries).toHaveLength(1);

    const delivery = deliveries[0];

    expect(delivery.activationTokenId).toBe(activationToken.id);
    expect(delivery.recipientEmail).toBe(successfulEmail);
    expect(delivery.status).toBe('PENDING');
    expect(delivery.attempts).toBe(0);
    expect(delivery.sentAt).toBeNull();
    expect(delivery.encryptedToken).toMatch(/^v1\./);

    // 7. Verify the encrypted token matches the stored hash.
    const rawToken = invitationSecurity.decryptToken(delivery.encryptedToken!);

    expect(invitationSecurity.hashToken(rawToken)).toBe(
      activationToken.tokenHash,
    );

    // 8. Verify no activation secrets appear in the response.
    const response = JSON.stringify(result);

    expect(response).not.toContain(rawToken);
    expect(response).not.toContain(delivery.encryptedToken!);
    expect(response).not.toContain(activationToken.tokenHash);

    // 9. Re-approving the application must fail.
    await expect(
      service.approveApplication(successfulApplicationId),
    ).rejects.toBeInstanceOf(ConflictException);

    // No duplicate administrator or invitation should be created.
    expect(
      await prisma.tenantAdmin.count({
        where: { tenantId: tenant.id },
      }),
    ).toBe(1);

    expect(
      await prisma.invitationDelivery.count({
        where: { tenantAdminId: administrator.id },
      }),
    ).toBe(1);
  });

  it('rolls back all records when invitation delivery violates a foreign key', async () => {
    const suffix = randomUUID();

    const applicationId = randomUUID();
    const tenantId = randomUUID();

    const slug = `c3-outbox-rollback-${suffix}`;
    const email = `c3-outbox-${suffix}@example.test`;

    // Create the initial application outside the transaction.
    await prisma.tenantApplication.create({
      data: {
        id: applicationId,
        companyName: 'C3 Outbox Rollback Company',
        slug,
        contactName: 'Test Owner',
        contactEmail: email,
        contactPhone: '+900000000002',
      },
    });

    try {
      // The application exists before approval begins.
      await expect(
        prisma.$transaction(async (tx) => {
          const claimed = await tx.tenantApplication.updateMany({
            where: {
              id: applicationId,
              status: 'PENDING',
              tenantId: null,
            },
            data: {
              status: 'APPROVED',
            },
          });

          expect(claimed.count).toBe(1);

          const tenant = await tx.tenant.create({
            data: {
              id: tenantId,
              name: 'C3 Outbox Rollback Company',
              slug,
              status: 'APPROVED',
            },
          });

          const admin = await tx.tenantAdmin.create({
            data: {
              tenantId: tenant.id,
              email,
            },
          });

          const token = invitationSecurity.generateToken();

          await tx.tenantActivationToken.create({
            data: {
              tenantAdminId: admin.id,
              tokenHash: invitationSecurity.hashToken(token),
              expiresAt: new Date(Date.now() + 86_400_000),
            },
          });

          // Deliberately use an ID that does not exist.
          // PostgreSQL must reject this InvitationDelivery record.
          await tx.invitationDelivery.create({
            data: {
              tenantAdminId: admin.id,
              activationTokenId: randomUUID(),
              recipientEmail: email,
              encryptedToken: invitationSecurity.encryptToken(token),
              status: 'PENDING',
            },
          });

          // This must never execute.
          await tx.tenantApplication.update({
            where: { id: applicationId },
            data: { tenantId: tenant.id },
          });
        }),
      ).rejects.toMatchObject({ code: 'P2003' });

      // The application must still be pending.
      const application = await prisma.tenantApplication.findUniqueOrThrow({
        where: { id: applicationId },
      });

      expect(application.status).toBe('PENDING');
      expect(application.tenantId).toBeNull();

      // Every new record must have been rolled back.
      expect(
        await prisma.tenant.findUnique({
          where: { id: tenantId },
        }),
      ).toBeNull();

      expect(
        await prisma.tenantAdmin.findUnique({
          where: { email },
        }),
      ).toBeNull();

      expect(
        await prisma.tenantActivationToken.count({
          where: { tenantAdmin: { email } },
        }),
      ).toBe(0);

      expect(
        await prisma.invitationDelivery.count({
          where: { recipientEmail: email },
        }),
      ).toBe(0);
    } finally {
      // Only the initial application was committed outside the transaction.
      await prisma.tenantApplication.deleteMany({
        where: { id: applicationId },
      });
    }
  });
});
