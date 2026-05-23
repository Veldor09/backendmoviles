import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VoluntariosService } from './voluntarios.service';

@Controller('voluntarios')
@UseGuards(AuthGuard('jwt'))
export class VoluntariosController {
  constructor(private service: VoluntariosService) {}

  @Get()
  findAll(@Request() req) {
    return this.service.findAll(req.user.id);
  }
}
