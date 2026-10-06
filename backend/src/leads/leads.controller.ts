import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreateLeadDto } from './dto/create-lead.dto.js';
import { LeadsService } from './leads.service.js';

@Controller('leads')
export class LeadsController {
  constructor(private readonly leadsService: LeadsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createLeadDto: CreateLeadDto) {
    return this.leadsService.create(createLeadDto);
  }
}
