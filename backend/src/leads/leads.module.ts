import { Module } from '@nestjs/common';
import { MailModule } from '../mail/mail.module.js';
import { PrismaModule } from '../prisma/prisma.module.js';
import { LeadsController } from './leads.controller.js';
import { LeadsService } from './leads.service.js';

@Module({
  imports: [PrismaModule, MailModule],
  controllers: [LeadsController],
  providers: [LeadsService],
})
export class LeadsModule {}
