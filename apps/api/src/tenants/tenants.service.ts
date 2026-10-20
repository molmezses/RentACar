import { ConflictException , Injectable } from '@nestjs/common';
import { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from "../prisma/prisma.service.js";
import { CreateTenantDto} from "./dto/create-tenant.dto.js";

@Injectable()
export class TenantsService {
    constructor(private readonly prisma: PrismaService){}

    async findAll(){
        return this.prisma.tenant.findMany();
    }

    async create(createTenantDto : CreateTenantDto){
        try{
            return await this.prisma.tenant.create({
            data : {
                name : createTenantDto.name,
                slug : createTenantDto.slug
            },
        });
        }catch(error){
            if (
                error instanceof Prisma.PrismaClientKnownRequestError &&
                error.code == 'P2002'
            ){
                throw new ConflictException("This slug is already in use.")
            }
            throw error;
        }
    }
}
