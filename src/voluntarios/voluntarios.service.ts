import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class VoluntariosService {
  constructor(private prisma: PrismaService) {}

  async findAll(encargadoId: number) {
    const programa = await this.prisma.programa.findUnique({ where: { encargadoId } });
    if (!programa) return [];

    const asignaciones = await this.prisma.voluntarioPrograma.findMany({
      where: { programaId: programa.id },
      include: { voluntario: { select: { id: true, nombre: true, email: true } } },
    });
    return asignaciones.map((a) => a.voluntario);
  }
}
