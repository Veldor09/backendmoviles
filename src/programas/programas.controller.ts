import { Controller, Delete, ForbiddenException, Get, Param, ParseIntPipe, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProgramasService } from './programas.service';

@Controller('programas')
@UseGuards(AuthGuard('jwt'))
export class ProgramasController {
  constructor(private service: ProgramasService) {}

  @Get('mi-programa')
  getMiPrograma(@Request() req) {
    return this.service.getMiPrograma(req.user.id, req.user.rol);
  }

  @Get('voluntarios-disponibles')
  getVoluntariosDisponibles(@Request() req) {
    if (req.user.rol !== 'ENCARGADO') throw new ForbiddenException('Solo encargados');
    return this.service.getVoluntariosDisponibles(req.user.id);
  }

  @Post('voluntarios/:voluntarioId')
  agregarVoluntario(@Request() req, @Param('voluntarioId', ParseIntPipe) voluntarioId: number) {
    if (req.user.rol !== 'ENCARGADO') throw new ForbiddenException('Solo encargados');
    return this.service.agregarVoluntario(req.user.id, voluntarioId);
  }

  @Delete('voluntarios/:voluntarioId')
  quitarVoluntario(@Request() req, @Param('voluntarioId', ParseIntPipe) voluntarioId: number) {
    if (req.user.rol !== 'ENCARGADO') throw new ForbiddenException('Solo encargados');
    return this.service.quitarVoluntario(req.user.id, voluntarioId);
  }
}
