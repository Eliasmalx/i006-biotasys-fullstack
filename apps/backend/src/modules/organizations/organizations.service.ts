import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
  ) {}

  create(dto: CreateOrganizationDto) {
    const org = this.orgRepo.create(dto);
    return this.orgRepo.save(org);
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    const org = await this.orgRepo.findOneBy({ id });
    if (!org) throw new NotFoundException('Organization not found');
    Object.assign(org, dto);
    return this.orgRepo.save(org);
  }
}
