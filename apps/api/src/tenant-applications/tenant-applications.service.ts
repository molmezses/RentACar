import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTenantApplicationDto } from './dto/create-tenant-application.dto.js';
import type { ApplicationStatusFilter } from './dto/list-tenant-applications-query.dto.js';

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

  async findAllForAdmin(status?: ApplicationStatusFilter) {
  return this.prisma.tenantApplication.findMany({
    ...(status ? { where: { status } } : {}),

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

async approveApplication(id: string) {
  try {
    return await this.prisma.$transaction(async (tx) => {
      // 1. Başvuruyu bul.
      const application = await tx.tenantApplication.findUnique({
        where: { id },
      });

      if (!application) {
        throw new NotFoundException(
          'Şirket başvurusu bulunamadı.',
        );
      }

      // 2. Yalnızca bekleyen başvurular onaylanabilir.
      if (
        application.status !== 'PENDING' ||
        application.tenantId !== null
      ) {
        throw new ConflictException(
          'Bu başvuru daha önce işleme alınmış.',
        );
      }

      // 3. Başvuruyu koşullu olarak onayla.
      const claimed = await tx.tenantApplication.updateMany({
        where: {
          id,
          status: 'PENDING',
          tenantId: null,
        },
        data: {
          status: 'APPROVED',
        },
      });

      if (claimed.count !== 1) {
        throw new ConflictException(
          'Başvuru başka bir işlem tarafından güncellendi.',
        );
      }

      // 4. Şirketin Tenant kaydını oluştur.
      const tenant = await tx.tenant.create({
        data: {
          name: application.companyName,
          slug: application.slug,
          status: 'APPROVED',
        },
      });

      // 5. Başvuruyu oluşturulan Tenant ile ilişkilendir.
      const updatedApplication =
        await tx.tenantApplication.update({
          where: { id },
          data: {
            tenantId: tenant.id,
          },
        });

      return {
        application: updatedApplication,
        tenant,
      };
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002'
    ) {
      throw new ConflictException(
        'Bu şirket slug değeri zaten kullanılıyor.',
      );
    }

    throw error;
  }

}

async rejectApplication(id: string) {
  // 1. Başvurunun var olup olmadığını kontrol et.
  const application = await this.prisma.tenantApplication.findUnique({
    where: { id },
  });

  if (!application) {
    throw new NotFoundException(
      'Şirket başvurusu bulunamadı.',
    );
  }

  // 2. Başvuru daha önce işleme alınmış mı?
  if (
    application.status !== 'PENDING' ||
    application.tenantId !== null
  ) {
    throw new ConflictException(
      'Bu başvuru daha önce işleme alınmış.',
    );
  }

  // 3. Yalnızca hâlâ bekleyen başvuruyu reddet.
  const result = await this.prisma.tenantApplication.updateMany({
    where: {
      id,
      status: 'PENDING',
      tenantId: null,
    },
    data: {
      status: 'REJECTED',
    },
  });

  // 4. Başka bir işlem araya girdiyse reddet.
  if (result.count !== 1) {
    throw new ConflictException(
      'Başvuru başka bir işlem tarafından güncellendi.',
    );
  }

  // 5. Güncellenmiş başvuruyu döndür.
  return this.prisma.tenantApplication.findUniqueOrThrow({
    where: { id },
  });
}
}