import { BaseRouter } from '../../router/router';
import { UtrController } from './utr.controller';
import { authenticateJWT } from '../../core/middleware/jwt.middleware';

export class UtrRouter extends BaseRouter<UtrController> {
    constructor() {
        super(UtrController);
    }

    routes(): void {
        // Solo administradores autenticados pueden registrar nuevas máquinas
        this.router.post('/utrs', authenticateJWT, (req, res) => this.controller.createUtr(req, res));
    }
}