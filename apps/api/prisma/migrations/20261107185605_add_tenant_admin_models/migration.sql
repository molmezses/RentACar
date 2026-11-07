-- CreateEnum
CREATE TYPE "InvitationDeliveryStatus" AS ENUM ('PENDING', 'PROCESSING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "TenantAdmin" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT,
    "emailVerifiedAt" TIMESTAMP(3),
    "activatedAt" TIMESTAMP(3),
    "disabledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantAdmin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantActivationToken" (
    "id" TEXT NOT NULL,
    "tenantAdminId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantActivationToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InvitationDelivery" (
    "id" TEXT NOT NULL,
    "tenantAdminId" TEXT NOT NULL,
    "activationTokenId" TEXT NOT NULL,
    "recipientEmail" TEXT NOT NULL,
    "encryptedToken" TEXT,
    "status" "InvitationDeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "nextAttemptAt" TIMESTAMP(3),
    "lockedUntil" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "lastErrorCode" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InvitationDelivery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantAdmin_tenantId_key" ON "TenantAdmin"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantAdmin_email_key" ON "TenantAdmin"("email");

-- CreateIndex
CREATE UNIQUE INDEX "TenantActivationToken_tokenHash_key" ON "TenantActivationToken"("tokenHash");

-- CreateIndex
CREATE INDEX "TenantActivationToken_tenantAdminId_expiresAt_idx" ON "TenantActivationToken"("tenantAdminId", "expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "InvitationDelivery_activationTokenId_key" ON "InvitationDelivery"("activationTokenId");

-- CreateIndex
CREATE INDEX "InvitationDelivery_status_nextAttemptAt_idx" ON "InvitationDelivery"("status", "nextAttemptAt");

-- CreateIndex
CREATE INDEX "InvitationDelivery_status_lockedUntil_idx" ON "InvitationDelivery"("status", "lockedUntil");

-- CreateIndex
CREATE INDEX "InvitationDelivery_tenantAdminId_idx" ON "InvitationDelivery"("tenantAdminId");

-- AddForeignKey
ALTER TABLE "TenantAdmin" ADD CONSTRAINT "TenantAdmin_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantActivationToken" ADD CONSTRAINT "TenantActivationToken_tenantAdminId_fkey" FOREIGN KEY ("tenantAdminId") REFERENCES "TenantAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationDelivery" ADD CONSTRAINT "InvitationDelivery_tenantAdminId_fkey" FOREIGN KEY ("tenantAdminId") REFERENCES "TenantAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InvitationDelivery" ADD CONSTRAINT "InvitationDelivery_activationTokenId_fkey" FOREIGN KEY ("activationTokenId") REFERENCES "TenantActivationToken"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
