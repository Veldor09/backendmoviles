import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateTareaDto {
  @IsString()
  @IsIn(['PENDIENTE', 'COMPLETADA', 'APROBADA', 'RECHAZADA'])
  estado: string;

  @IsOptional()
  @IsString()
  comentario?: string;
}
