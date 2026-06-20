import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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

  private async getProgramaDeEncargado(encargadoId: number) {
    const programa = await this.prisma.programa.findUnique({ where: { encargadoId } });
    if (!programa) throw new NotFoundException('No tienes un programa asignado');
    return programa;
  }

  async getVoluntariosDisponibles(encargadoId: number) {
    const programa = await this.getProgramaDeEncargado(encargadoId);
    const asignados = await this.prisma.voluntarioPrograma.findMany({
      where: { programaId: programa.id },
      select: { voluntarioId: true },
    });
    const asignadosIds = asignados.map((a) => a.voluntarioId);
    return this.prisma.usuario.findMany({
      where: { rol: 'VOLUNTARIO', id: { notIn: asignadosIds } },
      select: { id: true, nombre: true, email: true },
    });
  }

  async agregarVoluntario(encargadoId: number, voluntarioId: number) {
    const programa = await this.getProgramaDeEncargado(encargadoId);
    const voluntario = await this.prisma.usuario.findUnique({ where: { id: voluntarioId } });
    if (!voluntario || voluntario.rol !== 'VOLUNTARIO') {
      throw new BadRequestException('El usuario no es un voluntario válido');
    }
    const existe = await this.prisma.voluntarioPrograma.findUnique({
      where: { voluntarioId_programaId: { voluntarioId, programaId: programa.id } },
    });
    if (existe) throw new BadRequestException('El voluntario ya está en el programa');
    return this.prisma.voluntarioPrograma.create({
      data: { voluntarioId, programaId: programa.id },
    });
  }

  async quitarVoluntario(encargadoId: number, voluntarioId: number) {
    const programa = await this.getProgramaDeEncargado(encargadoId);
    const asignacion = await this.prisma.voluntarioPrograma.findUnique({
      where: { voluntarioId_programaId: { voluntarioId, programaId: programa.id } },
    });
    if (!asignacion) throw new NotFoundException('El voluntario no está en tu programa');
    return this.prisma.voluntarioPrograma.delete({
      where: { voluntarioId_programaId: { voluntarioId, programaId: programa.id } },
    });
  }
}
