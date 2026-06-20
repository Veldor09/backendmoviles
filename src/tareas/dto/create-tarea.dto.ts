import { IsDateString, IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateTareaDto {
  @IsNotEmpty()
  @IsString()
  titulo: string;

  @IsNotEmpty()
  @IsString()
  descripcion: string;

  @IsDateString()
  fechaLimite: string;

  @IsInt()
  voluntarioId: number;

  @IsInt()
  programaId: number;
}
