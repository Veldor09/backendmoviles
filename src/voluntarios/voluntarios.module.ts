import { Module } from '@nestjs/common';
import { VoluntariosController } from './voluntarios.controller';
import { VoluntariosService } from './voluntarios.service';
import { PrismaService } from '../prisma.service';

@Module({
  controllers: [VoluntariosController],
  providers: [VoluntariosService, PrismaService],
})
export class VoluntariosModule {}
