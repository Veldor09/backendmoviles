import { Injectable, ForbiddenException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { NotificationService } from '../notifications/notification.service';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';

const tareaInclude = {
  voluntario: { select: { id: true, nombre: true, email: true, fcmToken: true } },
  encargado: { select: { id: true, nombre: true, fcmToken: true } },
  programa: { select: { id: true, nombre: true } },
};

@Injectable()
export class TareasService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationService,
  ) {}

  async crear(dto: CreateTareaDto, encargadoId: number) {
    const tarea = await this.prisma.tarea.create({
      data: {
        descripcion: dto.descripcion,
        fechaLimite: new Date(dto.fechaLimite),
        voluntarioId: dto.voluntarioId,
        programaId: dto.programaId,
        encargadoId,
      },
      include: tareaInclude,
    });
    const token = (tarea.voluntario as any).fcmToken;
    if (token) {
      await this.notifications.send(token, '📋 Nueva tarea asignada', tarea.descripcion);
    }
    return tarea;
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

  async getTareasDelPrograma(encargadoId: number) {
    return this.prisma.tarea.findMany({
      where: { encargadoId },
      include: tareaInclude,
      orderBy: { createdAt: 'desc' },
    });
  }

  async marcarCompletada(id: number, voluntarioId: number) {
    const tarea = await this.prisma.tarea.findUnique({
      where: { id },
      include: { encargado: { select: { fcmToken: true } } },
    });
    if (!tarea) throw new BadRequestException('Tarea no encontrada');
    if (tarea.voluntarioId !== voluntarioId) throw new ForbiddenException();
    if (tarea.estado !== 'PENDIENTE') throw new BadRequestException('Solo se pueden completar tareas pendientes');

    const updated = await this.prisma.tarea.update({
      where: { id },
      data: { estado: 'COMPLETADA' },
      include: tareaInclude,
    });
    const token = (tarea.encargado as any).fcmToken;
    if (token) {
      await this.notifications.send(token, '✅ Tarea completada', `Un voluntario completó: ${tarea.descripcion}`);
    }
    return updated;
  }

  async actualizarEstado(id: number, dto: UpdateTareaDto, encargadoId: number) {
    const tarea = await this.prisma.tarea.findUnique({
      where: { id },
      include: { voluntario: { select: { fcmToken: true } } },
    });
    if (!tarea) throw new BadRequestException('Tarea no encontrada');
    if (tarea.encargadoId !== encargadoId) throw new ForbiddenException();
    if (tarea.estado !== 'COMPLETADA') {
      throw new BadRequestException('Solo se pueden aprobar/rechazar tareas en estado COMPLETADA');
    }
    if (!['APROBADA', 'RECHAZADA'].includes(dto.estado)) {
      throw new BadRequestException('Estado inválido para esta operación');
    }

    const updated = await this.prisma.tarea.update({
      where: { id },
      data: { estado: dto.estado },
      include: tareaInclude,
    });
    const token = (tarea.voluntario as any).fcmToken;
    if (token) {
      const titulo = dto.estado === 'APROBADA' ? '🎉 Tarea aprobada' : '❌ Tarea rechazada';
      await this.notifications.send(token, titulo, tarea.descripcion);
    }
    return updated;
  }
}
