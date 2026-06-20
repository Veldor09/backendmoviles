import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { CreateProgramaDto } from './dto/create-programa.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(private prisma: PrismaService) {}

  async getUsuarios() {
    return this.prisma.usuario.findMany({
      select: { id: true, nombre: true, email: true, rol: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async crearUsuario(dto: CreateUsuarioDto) {
    const existe = await this.prisma.usuario.findUnique({ where: { email: dto.email } });
    if (existe) throw new BadRequestException('El email ya está registrado');
    const password = await bcrypt.hash(dto.password, 10);
    return this.prisma.usuario.create({
      data: { nombre: dto.nombre, email: dto.email, password, rol: dto.rol },
      select: { id: true, nombre: true, email: true, rol: true },
    });
  }

  async getProgramas() {
    return this.prisma.programa.findMany({
      include: {
        encargado: { select: { id: true, nombre: true, email: true } },
        _count: { select: { voluntarios: true, tareas: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async crearPrograma(dto: CreateProgramaDto) {
    const encargado = await this.prisma.usuario.findUnique({ where: { id: dto.encargadoId } });
    if (!encargado || encargado.rol !== 'ENCARGADO') {
      throw new BadRequestException('El encargadoId debe corresponder a un usuario con rol ENCARGADO');
    }
    const yaAsignado = await this.prisma.programa.findUnique({ where: { encargadoId: dto.encargadoId } });
    if (yaAsignado) throw new BadRequestException('Este encargado ya tiene un programa asignado');
    return this.prisma.programa.create({
      data: { nombre: dto.nombre, descripcion: dto.descripcion, encargadoId: dto.encargadoId },
      include: { encargado: { select: { id: true, nombre: true, email: true } } },
    });
  }

  async getEncargados() {
    return this.prisma.usuario.findMany({
      where: { rol: 'ENCARGADO' },
      select: { id: true, nombre: true, email: true },
    });
  }
}
