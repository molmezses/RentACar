import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class TenantsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async findAll() {
    return this.prisma.tenant.findMany();
  }

  async findByIdForTenant(tenantId: string) {
  return this.prisma.tenant.findUniqueOrThrow({
    where: { id: tenantId },
    select: {
      id: true,
      name: true,
      slug: true,
      status: true,
      createdAt: true,
    },
  });
}
}