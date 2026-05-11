// web-server/src/server.ts

// Punto de entrada del servidor y levantamiento total de este.

import 'reflect-metadata';
import express = require('express');
import morgan = require('morgan');
import cors = require('cors');
import { UserRouter } from './domains/users/user.router';
import { TelemetryRouter } from './domains/telemetry/telemetry.router';
import { initializeDatabase } from './core/database/connection';
import { config } from './core/config/environment';
import { ReportRouter } from './domains/reports/report.router';
import { AuthRouter } from './domains/auth';
import { ClientRouter } from './domains/clients/client.router';

class ServerBootstrap {
    public app: express.Application = express();
    private port: number = config.PORT;

    constructor() {
        this.initializeServer();
    }

    private async initializeServer() {
        try {
        // Middlewares
        this.app.use(express.json({ limit: '10mb' })); // Aumento en el límite para datos
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(morgan('dev'));
        this.app.use(cors({
            origin: config.FRONTEND_URL,
            credentials: true
        }));

        // Database
        await initializeDatabase();

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
        } catch (error) {
        console.error('❌ Error inicializando servidor:', error);
        process.exit(1);
        }
    }

    // Método de routes
    routers(): express.Router[] {
        return [
            new AuthRouter().router,
            new UserRouter().router,
            new TelemetryRouter().router, // Añadir esta nueva ruta para telemetrías
            new ReportRouter().router,
            new ClientRouter().router
        ];
    }

    public listen() {
        this.app.listen(this.port, () => {
        console.log(` Servidor escuchando en el puerto ${this.port}`);
        console.log(` Entorno: ${process.env.NODE_ENV || 'development'}`);
        console.log(` Health check: http://localhost:${this.port}/health`);
        console.log(` Endponint Telemetría: https//localhost:${this.port}/api/telemetry`);
        });
    }
}

new ServerBootstrap();