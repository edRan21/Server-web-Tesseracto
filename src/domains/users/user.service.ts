// web-server/src/domains/users/user.service.ts
import { AppDataSource } from '../../core/database/connection';
import { User } from './user.entity';
import { Client } from '../clients/client.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { HashUtil } from '../../core/utils/hash.util';

export class UserService {
    private userRepository = AppDataSource.getRepository(User);
    private clientRepository = AppDataSource.getRepository(Client);

    /**
     * Obtener todos los usuarios con información del cliente
     */
    async getAllUsers(): Promise<{ success: boolean; users?: any[]; error?: string }> {
        try {
            const users = await this.userRepository.find({
                relations: ['client'],
                select: [
                    'id', 'username', 'role', 'client_id', 
                    'is_active', 'is_locked', 'failed_login_attempts', 
                    'last_login_ip', 'created_at', 'updated_at'
                ],
                order: { created_at: 'DESC' }
            });

            return {
                success: true,
                users: users.map(user => ({
                    ...user,
                    client_name: user.client?.company_name || 'Sin empresa asignada'
                }))
            };

        } catch (error) {
            console.error('Error obteniendo usuarios:', error);
            return {
                success: false,
                error: 'Error interno del servidor al obtener usuarios'
            };
        }
    }

    /**
     * Obtener usuario por ID
     */
    async getUserById(userId: number): Promise<{ success: boolean; user?: any; error?: string }> {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId },
                relations: ['client'],
                select: ['id', 'username', 'role', 'client_id', 'is_active', 'is_locked', 'failed_login_attempts', 'created_at']
            });

            if (!user) {
                return {
                    success: false,
                    error: 'Usuario no encontrado'
                };
            }

            return {
                success: true,
                user: {
                    ...user,
                    client_name: user.client?.company_name || 'Sin empresa asignada'
                }
            };

        } catch (error) {
            console.error('Error obteniendo usuario:', error);
            return {
                success: false,
                error: 'Error interno del servidor'
            };
        }
    }

    /**
     * Activar/desactivar usuario
     */
    async toggleUserStatus(userId: number, isActive: boolean): Promise<{ success: boolean; error?: string }> {
        try {
            const result = await this.userRepository.update(userId, { is_active: isActive });
            
            if (result.affected === 0) {
                return {
                    success: false,
                    error: 'Usuario no encontrado'
                };
            }
            
            return {
                success: true
            };

        } catch (error) {
            console.error('Error actualizando estado de usuario:', error);
            return {
                success: false,
                error: 'Error interno del servidor al actualizar usuario'
            };
        }
    }

    /**
     * Desbloquear usuario
     */
    async unlockUser(userId: number): Promise<{ success: boolean; error?: string }> {
        try {
            const result = await this.userRepository
                .createQueryBuilder()
                .update(User)
                .set({ 
                    is_locked: false,
                    locked_until: null,
                    failed_login_attempts: 0
                })
                .where("id = :id", { id: userId })
                .execute();

            if (result.affected === 0) {
                return {
                    success: false,
                    error: 'Usuario no encontrado'
                };
            }
            
            return {
                success: true
            };

        } catch (error) {
            console.error('Error desbloqueando usuario:', error);
            return {
                success: false,
                error: 'Error interno del servidor al desbloquear usuario'
            };
        }
    }

    /**
     * Eliminar usuario permanentemente
     */
    async deleteUser(userId: number): Promise<{ success: boolean; error?: string }> {
        try {
            // Verificar que el usuario existe
            const user = await this.userRepository.findOne({
                where: { id: userId }
            });

            if (!user) {
                return {
                    success: false,
                    error: 'Usuario no encontrado'
                };
            }

            // No permitir eliminar al propio SUPER_ADMIN
            if (user.role === 'super_admin') {
                return {
                    success: false,
                    error: 'No se puede eliminar una cuenta de SUPER_ADMIN'
                };
            }

            const result = await this.userRepository.delete(userId);

            if (result.affected === 0) {
                return {
                    success: false,
                    error: 'No se pudo eliminar el usuario'
                };
            }

            return {
                success: true
            };

        } catch (error) {
            console.error('Error eliminando usuario:', error);
            return {
                success: false,
                error: 'Error interno del servidor al eliminar usuario'
            };
        }
    }

    /**
     * Actualizar información de usuario
     */
    async updateUser(userId: number, updateData: UpdateUserDto): Promise<{ success: boolean; error?: string }> {
        try {
            const user = await this.userRepository.findOne({
                where: { id: userId }
            });

            if (!user) {
                return {
                    success: false,
                    error: 'Usuario no encontrado'
                };
            }

            // Si se envió una nueva contraseña, delegamos el hasheo a la utilidad (SRP)
            if (updateData.password) {
                // NOTA: Tu entidad usa 'password_hash', no 'password'
                user.password_hash = await HashUtil.generateHash(updateData.password); 
            }

            // Actualizamos solo los campos que vienen en el DTO
            if (updateData.username !== undefined) user.username = updateData.username;
            if (updateData.role !== undefined) user.role = updateData.role;
            if (updateData.client_id !== undefined) user.client_id = updateData.client_id;
            if (updateData.is_active !== undefined) user.is_active = updateData.is_active;

            await this.userRepository.save(user);

            return {
                success: true
            };

        } catch (error) {
            console.error('Error actualizando usuario:', error);
            return {
                success: false,
                error: 'Error interno del servidor al actualizar usuario'
            };
        }
    }

    /**
     * Obtener estadísticas de usuarios
     */
    async getUserStats(): Promise<{ success: boolean; stats?: any; error?: string }> {
        try {
            const totalUsers = await this.userRepository.count();
            const activeUsers = await this.userRepository.count({ where: { is_active: true } });
            const lockedUsers = await this.userRepository.count({ where: { is_locked: true } });
            const superAdminCount = await this.userRepository.count({ where: { role: 'super_admin' } });
            const userRoleCount = await this.userRepository.count({ where: { role: 'user' } });

            return {
                success: true,
                stats: {
                    total_users: totalUsers,
                    active_users: activeUsers,
                    locked_users: lockedUsers,
                    super_admin_count: superAdminCount,
                    user_role_count: userRoleCount
                }
            };

        } catch (error) {
            console.error('Error obteniendo estadísticas:', error);
            return {
                success: false,
                error: 'Error interno del servidor al obtener estadísticas'
            };
        }
    }
}