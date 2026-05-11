import { BaseRouter } from "../../router/router";
import { ClientController } from "./client.controller";
import { authenticateJWT } from "../../core/middleware/jwt.middleware";
// Importamos el guardia correcto que ya tenías programado
import { requireAdmin } from "../../core/middleware/roles.middleware"; 

export class ClientRouter extends BaseRouter<ClientController> {
    constructor() {
        super(ClientController);
    }

    routes(): void {
        // Usamos requireAdmin para proteger la ruta
        this.router.get('/clients', authenticateJWT, requireAdmin, (req, res) => this.controller.getClients(req, res));
    }
}