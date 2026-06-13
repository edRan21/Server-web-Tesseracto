"use strict";
// web-server/src/server.ts
Object.defineProperty(exports, "__esModule", { value: true });
// Punto de entrada del servidor y levantamiento total de este.
require("reflect-metadata");
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const user_router_1 = require("./domains/users/user.router");
const telemetry_router_1 = require("./domains/telemetry/telemetry.router");
const connection_1 = require("./core/database/connection");
const environment_1 = require("./core/config/environment");
const report_router_1 = require("./domains/reports/report.router");
const auth_1 = require("./domains/auth");
const client_router_1 = require("./domains/clients/client.router");
class ServerBootstrap {
    constructor() {
        this.app = express();
        this.port = environment_1.config.PORT;
        this.initializeServer();
    }
    async initializeServer() {
        try {
            // Middlewares
            this.app.use(express.json({ limit: '10mb' })); // Aumento en el límite para datos
            this.app.use(express.urlencoded({ extended: true }));
            this.app.use(morgan('dev'));
            this.app.use(cors({
                origin: environment_1.config.FRONTEND_URL,
                credentials: true
            }));
            // Database
            await (0, connection_1.initializeDatabase)();
            // Routes
            this.app.use('/api', this.routers());
            // Health check
            this.app.get('/health', (req, res) => {
                res.status(200).json({
                    status: 'OK',
                    timestamp: new Date().toISOString(),
                    database: 'Connected'
                });
            });
            this.listen();
        }
        catch (error) {
            console.error('❌ Error inicializando servidor:', error);
            process.exit(1);
        }
    }
    // Método de routes
    routers() {
        return [
            new auth_1.AuthRouter().router,
            new user_router_1.UserRouter().router,
            new telemetry_router_1.TelemetryRouter().router, // Añadir esta nueva ruta para telemetrías
            new report_router_1.ReportRouter().router,
            new client_router_1.ClientRouter().router
        ];
    }
    listen() {
        this.app.listen(this.port, () => {
            console.log(` Servidor escuchando en el puerto ${this.port}`);
            console.log(` Entorno: ${process.env.NODE_ENV || 'development'}`);
            console.log(` Health check: http://localhost:${this.port}/health`);
            console.log(` Endponint Telemetría: https//localhost:${this.port}/api/telemetry`);
        });
    }
}
new ServerBootstrap();
//# sourceMappingURL=server.js.map