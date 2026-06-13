// web-server/src/core/utils/hash.util.ts
import * as bcrypt from 'bcryptjs'; // <-- Corregido a la librería que tú usas

export class HashUtil {
    private static readonly SALT_ROUNDS = 12; // <-- Ajustado a 12 para que coincida con la seguridad de tu auth.service.ts

    /**
     * Genera un hash seguro utilizando bcryptjs.
     * @param plainText Texto plano a encriptar
     * @returns Promesa con el texto hasheado
     */
    public static async generateHash(plainText: string): Promise<string> {
        return await bcrypt.hash(plainText, this.SALT_ROUNDS);
    }
}