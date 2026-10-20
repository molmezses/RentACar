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
}