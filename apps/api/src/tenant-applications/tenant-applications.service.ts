import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTenantApplicationDto } from './dto/create-tenant-application.dto.js';

@Injectable()
export class TenantApplicationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTenantApplicationDto: CreateTenantApplicationDto) {
    return this.prisma.tenantApplication.create({
      data: {
        companyName: createTenantApplicationDto.companyName,
        slug: createTenantApplicationDto.slug,
        contactName: createTenantApplicationDto.contactName,
        contactEmail: createTenantApplicationDto.contactEmail,
        contactPhone: createTenantApplicationDto.contactPhone,
      },
    });
  }

  async findAllForAdmin() {
  return this.prisma.tenantApplication.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: 50,
    select: {
      id: true,
      companyName: true,
      slug: true,
      contactName: true,
      contactEmail: true,
      contactPhone: true,
      status: true,
      tenantId: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}
}