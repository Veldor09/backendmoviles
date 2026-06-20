import { IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateProgramaDto {
  @IsString()
  nombre: string;

  @IsOptional()
  @IsString()
  descripcion?: string;

  @IsNumber()
  encargadoId: number;
}
