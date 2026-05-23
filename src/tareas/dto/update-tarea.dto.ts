import { IsIn, IsString } from 'class-validator';

export class UpdateTareaDto {
  @IsString()
  @IsIn(['PENDIENTE', 'COMPLETADA', 'APROBADA', 'RECHAZADA'])
  estado: string;
}
