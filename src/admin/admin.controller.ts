import { Body, Controller, ForbiddenException, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AdminService } from './admin.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { CreateProgramaDto } from './dto/create-programa.dto';

@Controller('admin')
@UseGuards(AuthGuard('jwt'))
export class AdminController {
  constructor(private service: AdminService) {}

  private checkAdmin(req: any) {
    if (req.user.rol !== 'ADMIN') throw new ForbiddenException('Solo administradores');
  }

  @Get('usuarios')
  getUsuarios(@Request() req) {
    this.checkAdmin(req);
    return this.service.getUsuarios();
  }

  @Post('usuarios')
  crearUsuario(@Request() req, @Body() dto: CreateUsuarioDto) {
    this.checkAdmin(req);
    return this.service.crearUsuario(dto);
  }

  @Get('programas')
  getProgramas(@Request() req) {
    this.checkAdmin(req);
    return this.service.getProgramas();
  }

  @Post('programas')
  crearPrograma(@Request() req, @Body() dto: CreateProgramaDto) {
    this.checkAdmin(req);
    return this.service.crearPrograma(dto);
  }

  @Get('encargados')
  getEncargados(@Request() req) {
    this.checkAdmin(req);
    return this.service.getEncargados();
  }
}
