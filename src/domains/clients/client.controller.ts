import { Request, Response } from 'express';
import { ClientService } from './client.service';

export class ClientController {
    private clientService: ClientService;

    constructor() {
        this.clientService = new ClientService();
    }

    public async getClients(req: Request, res: Response) {
        try {
            const clients = await this.clientService.getAllClients();
            // Respondemos con éxito y entregamos la lista
            res.status(200).json({ success: true, data: clients });
        } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: 'Error al obtener la lista de clientes' });
        }
    }
}