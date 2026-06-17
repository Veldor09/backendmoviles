import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, Request, UseGuards, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TareasService } from './tareas.service';
import { CreateTareaDto } from './dto/create-tarea.dto';
import { UpdateTareaDto } from './dto/update-tarea.dto';

@Controller('tareas')
@UseGuards(AuthGuard('jwt'))
export class TareasController {
  constructor(private service: TareasService) {}

  @Post()
  crear(@Body() dto: CreateTareaDto, @Request() req) {
    if (req.user.rol !== 'ENCARGADO') throw new ForbiddenException('Solo encargados pueden crear tareas');
    return this.service.crear(dto, req.user.id);
  }

  @Get('mis-tareas')
  getMisTareas(@Request() req) {
    return this.service.getMisTareas(req.user.id);
  }

  @Get('completadas')
  getTareasCompletadas(@Request() req) {
    if (req.user.rol !== 'ENCARGADO') throw new ForbiddenException('Solo encargados pueden ver esto');
    return this.service.getTareasCompletadas(req.user.id);
  }

  @Get('del-programa')
  getTareasDelPrograma(@Request() req) {
    if (req.user.rol !== 'ENCARGADO') throw new ForbiddenException('Solo encargados');
    return this.service.getTareasDelPrograma(req.user.id);
  }

  @Put(':id')
  marcarCompletada(@Param('id', ParseIntPipe) id: number, @Request() req) {
    return this.service.marcarCompletada(id, req.user.id);
  }

  @Put(':id/estado')
  actualizarEstado(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTareaDto, @Request() req) {
    if (req.user.rol !== 'ENCARGADO') throw new ForbiddenException('Solo encargados pueden aprobar/rechazar');
    return this.service.actualizarEstado(id, dto, req.user.id);
  }
}
