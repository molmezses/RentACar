import { describe, expect, it, vi } from 'vitest';
import { TenantsService } from './tenants.service.js';
import { PrismaService } from '../prisma/prisma.service.js';
import { ConflictException } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';

describe('TenantsService', () => {
    it('should return all tenants', async () => {
        const tenants = [
            {
                id: 'tenant-1',
                name: 'Ankara Rent A Car',
                slug: 'ankara-rent-a-car',
                status: 'PENDING',
            },
        ];

        const prisma = {
            tenant: {
                findMany: vi.fn().mockResolvedValue(tenants),
            },
        };

        const service = new TenantsService(
            prisma as unknown as PrismaService,
        );

        const result = await service.findAll();

        expect(result).toEqual(tenants);
        expect(prisma.tenant.findMany).toHaveBeenCalledOnce();
    });

    it('should create a tenant', async () => {
        const createTenantDto = {
            name: 'Istanbul Rent A Car',
            slug: 'istanbul-rent-a-car',
        };

        const createdTenant = {
            id: 'tenant-2',
            ...createTenantDto,
            status: 'PENDING',
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const prisma = {
            tenant: {
                create: vi.fn().mockResolvedValue(createdTenant),
            },
        };

        const service = new TenantsService(
            prisma as unknown as PrismaService,
        );

        const result = await service.create(createTenantDto);

        expect(result).toEqual(createdTenant);

        expect(prisma.tenant.create).toHaveBeenCalledWith({
            data: {
                name: 'Istanbul Rent A Car',
                slug: 'istanbul-rent-a-car',
            },
        });
    });

    it('should throw ConflictException when slug already exists', async () => {
        const createTenantDto = {
            name: 'Ankara Rent A Car',
            slug: 'ankara-rent-a-car',
        };

        const prismaError = new Prisma.PrismaClientKnownRequestError(
            'Unique constraint failed',
            {
                code: 'P2002',
                clientVersion: '7.10.0',
                meta: { target: ['slug'] },
            },
        );

        const prisma = {
            tenant: {
                create: vi.fn().mockRejectedValue(prismaError),
            },
        };

        const service = new TenantsService(
            prisma as unknown as PrismaService,
        );

        await expect(
            service.create(createTenantDto),
        ).rejects.toThrow(ConflictException);

        expect(prisma.tenant.create).toHaveBeenCalledOnce();
    });
});