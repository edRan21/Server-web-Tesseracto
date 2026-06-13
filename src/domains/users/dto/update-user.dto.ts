// web-server/src/domains/users/dto/update-user.dto.ts
import { IsString, IsIn, IsOptional, IsBoolean, IsNumber, Matches } from 'class-validator';

export class UpdateUserDto {
    @IsOptional()
    @IsString({ message: 'El nombre de usuario debe ser una cadena de texto' })
    @Matches(/^[a-zA-Z0-9_]+$/, { 
        message: 'El nombre de usuario solo puede contener letras, números y guiones bajos' 
    })
    username?: string;

    // --- NUEVO: Campo opcional para cambiar la contraseña ---
    @IsOptional()
    @IsString({ message: 'La contraseña debe ser una cadena de texto' })
    password?: string;

    @IsOptional()
    @IsString({ message: 'El rol debe ser una cadena de texto' })
    @IsIn(['super_admin', 'admin', 'user'], { message: 'Rol inválido' })
    role?: string;

    @IsOptional()
    @IsNumber({}, { message: 'client_id debe ser un número' })
    client_id?: number;

    @IsOptional()
    @IsBoolean({ message: 'is_active debe ser un valor booleano' })
    is_active?: boolean;
}