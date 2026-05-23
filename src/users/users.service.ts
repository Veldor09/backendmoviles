import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  findById(id: number) {
    return this.prisma.usuario.findUnique({
      where: { id },
      select: { id: true, email: true, nombre: true, rol: true },
    });
  }
}
