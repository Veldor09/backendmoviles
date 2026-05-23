import { Controller, Get, UseGuards, Request } from '@nestjs/common';
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
}
