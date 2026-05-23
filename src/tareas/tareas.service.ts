import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';

const tareaInclude = {
  voluntario: { select: { id: true, nombre: true, email: true } },
  encargado: { select: { id: true, nombre: true } },
  programa: { select: { id: true, nombre: true } },
};

@Injectable()
export class TareasService {
  constructor(private prisma: PrismaService) {}

  async crear(dto: CreateTareaDto, encargadoId: number) {
    return this.prisma.tarea.create({
      data: {
        descripcion: dto.descripcion,
        fechaLimite: new Date(dto.fechaLimite),
        voluntarioId: dto.voluntarioId,
        programaId: dto.programaId,
        encargadoId,
      },
      include: tareaInclude,
    });
  }

  async getMisTareas(voluntarioId: number) {
    return this.prisma.tarea.findMany({
      where: { voluntarioId },
      include: tareaInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async getTareasCompletadas(encargadoId: number) {
    return this.prisma.tarea.findMany({
      where: { encargadoId, estado: 'COMPLETADA' },
      include: tareaInclude,
      orderBy: { updatedAt: 'desc' },
    });
  }

  async marcarCompletada(id: number, voluntarioId: number) {
    const tarea = await this.prisma.tarea.findUnique({ where: { id } });
    if (!tarea) throw new BadRequestException('Tarea no encontrada');
    if (tarea.voluntarioId !== voluntarioId) throw new ForbiddenException();
    if (tarea.estado !== 'PENDIENTE') throw new BadRequestException('Solo se pueden completar tareas pendientes');

    return this.prisma.tarea.update({
      where: { id },
      data: { estado: 'COMPLETADA' },
      include: tareaInclude,
    });
  }

  async actualizarEstado(id: number, dto: UpdateTareaDto, encargadoId: number) {
    const tarea = await this.prisma.tarea.findUnique({ where: { id } });
    if (!tarea) throw new BadRequestException('Tarea no encontrada');
    if (tarea.encargadoId !== encargadoId) throw new ForbiddenException();
    if (tarea.estado !== 'COMPLETADA') {
      throw new BadRequestException('Solo se pueden aprobar/rechazar tareas en estado COMPLETADA');
    }
    if (!['APROBADA', 'RECHAZADA'].includes(dto.estado)) {
      throw new BadRequestException('Estado inválido para esta operación');
    }

    return this.prisma.tarea.update({
      where: { id },
      data: { estado: dto.estado },
      include: tareaInclude,
    });
  }
}
