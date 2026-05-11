import { AppDataSource } from "../../core/database/connection";
import { Client } from "./client.entity";

export class ClientService {
    // Nos conectamos a la tabla de clientes
    private clientRepo = AppDataSource.getRepository(Client);

    public async getAllClients() {
        // Buscamos todos los clientes registrados
        return await this.clientRepo.find();
    }
}