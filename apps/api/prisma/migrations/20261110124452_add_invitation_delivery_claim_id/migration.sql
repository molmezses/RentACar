/*
  Warnings:

  - A unique constraint covering the columns `[claimId]` on the table `InvitationDelivery` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "InvitationDelivery" ADD COLUMN     "claimId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "InvitationDelivery_claimId_key" ON "InvitationDelivery"("claimId");
