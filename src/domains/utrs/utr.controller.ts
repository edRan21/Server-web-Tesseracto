import { Request, Response } from 'express';
import { UtrService } from './utr.service';

export class UtrController {
    private utrService = new UtrService();

    async createUtr(req: Request, res: Response) {
        try {
            const payload = req.body;

            // Bloqueamos la petición si falta cualquier número de serie o el ID del cliente
            if (!payload.nsue || !payload.nsm || !payload.nsut || !payload.client_id) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'Los campos NSUE, NSM, NSUT y el identificador de la empresa son obligatorios.' 
                });
            }

            const result = await this.utrService.createUtr(payload);

            if (result.success) {
                return res.status(201).json(result);
            } else {
                return res.status(400).json(result);
            }
        } catch (error) {
            return res.status(500).json({ success: false, error: 'Error interno del servidor.' });
        }
    }
}