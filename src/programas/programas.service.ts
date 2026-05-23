import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ProgramasService {
  constructor(private prisma: PrismaService) {}

  async getMiPrograma(userId: number, rol: string) {
    if (rol === 'ENCARGADO') {
      const programa = await this.prisma.programa.findUnique({
        where: { encargadoId: userId },
        include: { encargado: { select: { id: true, nombre: true, email: true } } },
      });
      if (!programa) throw new NotFoundException('No tienes un programa asignado');
      return programa;
    }

    // Voluntario
    const asignacion = await this.prisma.voluntarioPrograma.findFirst({
      where: { voluntarioId: userId },
      include: {
        programa: {
          include: { encargado: { select: { id: true, nombre: true, email: true } } },
        },
      },
    });
    if (!asignacion) throw new NotFoundException('No tienes un programa asignado');
    return asignacion.programa;
  }
}
