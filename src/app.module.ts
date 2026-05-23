import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { ProgramasModule } from './programas/programas.module';
import { TareasModule } from './tareas/tareas.module';
import { VoluntariosModule } from './voluntarios/voluntarios.module';
import { UsersModule } from './users/users.module';
import { PrismaService } from './prisma.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    UsersModule,
    ProgramasModule,
    TareasModule,
    VoluntariosModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
