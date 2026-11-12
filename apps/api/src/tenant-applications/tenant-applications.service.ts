import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTenantApplicationDto } from './dto/create-tenant-application.dto.js';
import type { ApplicationStatusFilter } from './dto/list-tenant-applications-query.dto.js';

import { InvitationSecurityService } from '../invitation-security/invitation-security.service.js';

@Injectable()
export class TenantApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly invitationSecurity: InvitationSecurityService,
  ) {}

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
        // 1. Find the application.
        const application = await tx.tenantApplication.findUnique({
          where: { id },
        });

        if (!application) {
          throw new NotFoundException('Tenant application is not found.');
        }

        // 2. Only pending applications can be approved.
        if (application.status !== 'PENDING' || application.tenantId !== null) {
          throw new ConflictException(
            'This application has already been proceesed.',
          );
        }

        // 3. Conditionally claim the application.
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
            'This application was updated by another transaction. ',
          );
        }

        // 4. Create the tenant.
        const tenant = await tx.tenant.create({
          data: {
            name: application.companyName,
            slug: application.slug,
            status: 'APPROVED',
          },
        });

        // 5. Create the tenant administrator.
        const tenantAdmin = await tx.tenantAdmin.create({
          data: {
            tenantId: tenant.id,
            email: application.contactEmail.trim().toLowerCase(),
          },
        });

        // 6. Generate the activation token and its protected copies.
        const rawToken = this.invitationSecurity.generateToken();
        const tokenHash = this.invitationSecurity.hashToken(rawToken);
        const encryptedToken = this.invitationSecurity.encryptToken(rawToken);

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // 7. Persist only the token hash for activation verification.
        const activationToken = await tx.tenantActivationToken.create({
          data: {
            tenantAdminId: tenantAdmin.id,
            tokenHash,
            expiresAt,
          },
        });

        // 8. Persist a durable invitation delivery job.
        await tx.invitationDelivery.create({
          data: {
            tenantAdminId: tenantAdmin.id,
            activationTokenId: activationToken.id,
            recipientEmail: tenantAdmin.email,
            encryptedToken,
            status: 'PENDING',
          },
        });

        // 9. Link the approved application to its tenant.
        const updatedApplication = await tx.tenantApplication.update({
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
        const target = error.meta?.['target'];

        if (Array.isArray(target) && target.includes('slug')) {
          throw new ConflictException('this slug value is already in use.');
        }

        if (Array.isArray(target) && target.includes('email')) {
          throw new ConflictException(
            'A tenant administrator with this email address already exists.',
          );
        }

        throw new ConflictException(
          'This process violates a unique registration restriction.',
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
      throw new NotFoundException('Şirket başvurusu bulunamadı.');
    }

    // 2. Başvuru daha önce işleme alınmış mı?
    if (application.status !== 'PENDING' || application.tenantId !== null) {
      throw new ConflictException('Bu başvuru daha önce işleme alınmış.');
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

  //Başvuru durumu PENDING veya REJECTED ise ve tenantId null ise başvuruyu sil
  async deleteApplication(id: string): Promise<void> {
  try {
    const result = await this.prisma.tenantApplication.deleteMany({
      where: {
        id,
        status: {
          in: ['PENDING', 'REJECTED'],
        },
        tenantId: null,
      },
    });
    //kayıt silinirse işlem başarılı
    if (result.count === 1) {
      return;
    }
    //kayıt silinmediyse başvurunun mevcut olup olmadığı kontrol ediliyor
    const application = await this.prisma.tenantApplication.findUnique({
      where: { id },
      select: {
        id: true,
      },
    });
    //kayıt yoksa 404 silinmeye uygun değilse 409 döndürür
    if (!application) {
      throw new NotFoundException('Tenant application not found.');
    }

    throw new ConflictException(
      'Approved or tenant-linked applications cannot be deleted.',
    );
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2003'
    ) {
      throw new ConflictException(
        'This application cannot be deleted because related records exist.',
      );
    }

    throw error;
  }
}

  async findOneForAdmin(id: string) {
    const application = await this.prisma.tenantApplication.findUnique({
      where: {
        id,
      },
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

    if (!application) {
      throw new NotFoundException('Tenant application not found');
    }

    return application;
  }
}
