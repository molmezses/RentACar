-- CreateTable
CREATE TABLE "TenantAdminSession" (
    "id" TEXT NOT NULL,
    "tenantAdminId" TEXT NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TenantAdminSession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TenantAdminSession_refreshTokenHash_key" ON "TenantAdminSession"("refreshTokenHash");

-- CreateIndex
CREATE INDEX "TenantAdminSession_tenantAdminId_idx" ON "TenantAdminSession"("tenantAdminId");

-- CreateIndex
CREATE INDEX "TenantAdminSession_expiresAt_idx" ON "TenantAdminSession"("expiresAt");

-- AddForeignKey
ALTER TABLE "TenantAdminSession" ADD CONSTRAINT "TenantAdminSession_tenantAdminId_fkey" FOREIGN KEY ("tenantAdminId") REFERENCES "TenantAdmin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
