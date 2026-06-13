import { AppDataSource } from "../../core/database/connection";
import { UTR } from "./utr.entity";
import { Client } from "../clients/client.entity";

export class UtrService {
    private utrRepo = AppDataSource.getRepository(UTR);
    private clientRepo = AppDataSource.getRepository(Client);

    async createUtr(data: Partial<UTR>): Promise<{ success: boolean; utr?: UTR; error?: string }> {
        try {
            // 1. Verificamos que la empresa exista
            const client = await this.clientRepo.findOne({ where: { id: data.client_id } });
            if (!client) {
                return { success: false, error: 'La empresa asignada no existe.' };
            }

            // 2. Validaciones de unicidad estricta (sin consecutividad)
            const existingNsue = await this.utrRepo.findOne({ where: { nsue: data.nsue } });
            if (existingNsue) {
                return { success: false, error: `El NSUE '${data.nsue}' ya está registrado en otra telemetría.` };
            }

            const existingNsm = await this.utrRepo.findOne({ where: { nsm: data.nsm } });
            if (existingNsm) {
                return { success: false, error: `El NSM '${data.nsm}' ya está registrado en otra telemetría.` };
            }

            const existingNsut = await this.utrRepo.findOne({ where: { nsut: data.nsut } });
            if (existingNsut) {
                return { success: false, error: `El NSUT '${data.nsut}' ya está registrado en otra telemetría.` };
            }

            // 3. Creamos y guardamos la máquina
            const newUtr = this.utrRepo.create({
                nsue: data.nsue,
                nsm: data.nsm,
                nsut: data.nsut,
                client_id: data.client_id,
                is_active: data.is_active !== undefined ? data.is_active : true
            });

            const savedUtr = await this.utrRepo.save(newUtr);
            
            return { success: true, utr: savedUtr };
        } catch (error) {
            console.error('Error al registrar UTR:', error);
            return { success: false, error: 'Error interno de la base de datos al registrar UTR.' };
        }
    }
}