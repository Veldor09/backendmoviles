import { IsEmail, IsIn, IsString, MinLength } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  nombre: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsIn(['ADMIN', 'ENCARGADO', 'VOLUNTARIO'])
  rol: string;
}
