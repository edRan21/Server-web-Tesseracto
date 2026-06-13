// src/domains/reports/report.controller.ts
import { Request, Response } from 'express';
import { ReportService } from './report.service';

export class ReportController {
    private reportService = new ReportService();

    /**
     * ENDPOINT PRINCIPAL PARA RECIBIR REPORTES - EXPLICACIÓN:
     * - Acepta tanto objetos individuales como arrays
     * - Responde con estadísticas detalladas
     * - Códigos HTTP apropiados para cada escenario
     */
    async receiveReports(req: Request, res: Response) {
        try {
            const payload = req.body;
            
            console.log('📨 Solicitud recibida en /api/reports');
            
            // VALIDAR PAYLOAD BÁSICO
            if (!payload || (Array.isArray(payload) && payload.length === 0)) {
                return res.status(400).json({
                    success: false,
                    error: 'Payload vacío',
                    message: 'Se requiere un objeto de reporte o array de reportes'
                });
            }

            if (Array.isArray(payload)) {
                // DETERMINAR SI ES LOTE O INDIVIDUAL
                console.log(`📦 Detectado lote con ${payload.length} reportes`);
                
                // VALIDAR LÍMITE DE LOTE
                if (payload.length > 50) {
                    return res.status(400).json({
                        success: false,
                        error: 'Lote demasiado grande',
                        message: 'Máximo 50 reportes por lote. Envíe lotes más pequeños.'
                    });
                }

                const result = await this.reportService.processBatchReports(payload);
                
                // Determinar código HTTP apropiado para el lote
                const hasErrors = result.errors > 0;
                const statusCode = hasErrors ? 207 : 200; // 207 = Multi-Status
                
                return res.status(statusCode).json({
                    success: true,
                    message: `Lote procesado: ${result.processed} nuevos, ${result.duplicates} duplicados, ${result.errors} errores`,
                    processed: result.processed,
                    duplicates: result.duplicates,
                    errors: result.errors,
                    results: result.results
                });

            } else {
                // PROCESAMIENTO INDIVIDUAL
                console.log(`📄 Procesando reporte individual: ${payload.file_name}`);
                
                const individualResult = await this.reportService.processSingleReport(payload);
                
                if (individualResult.success) {
                    const statusCode = individualResult.report?.status === 'duplicate' ? 200 : 201;
                    
                    // ✅ CORRECCIÓN: No usar spread operator para evitar duplicar 'success'
                    const response: any = {
                        success: true,
                        message: individualResult.report?.status === 'duplicate' 
                            ? 'Reporte duplicado (ya existía)' 
                            : 'Reporte procesado correctamente'
                    };

                // ✅ CORRECCIÓN: Añadir report solo si existe
                if (individualResult.report) {
                    response.report = individualResult.report;
                }

                    return res.status(statusCode).json(response);
                } else {
                // ✅ CORRECCIÓN: No usar spread operator para evitar duplicar 'success'
                    return res.status(400).json({
                        success: false,
                        error: individualResult.error
                    });
                }
            }

            } catch (error: any) {
                console.error('❌ Error crítico en receiveReports:', error);
            
                return res.status(500).json({
                    success: false,
                    error: 'Error interno del servidor',
                    message: 'No se pudo procesar la solicitud de reportes'
                    });
            }
    }

    /**
     * ENDPOINT PARA ENTREGAR REPORTES AL FRONTEND
     */
    async getReports(req: any, res: Response) {
        try {
            // El usuario viene del middleware del JWT
            const user = req.user; 
            const { startDate, endDate } = req.query;

            const result = await this.reportService.getReports(user, startDate as string, endDate as string);

            if (result.success) {
                return res.status(200).json(result);
            } else {
                return res.status(400).json(result);
            }
        } catch (error) {
            console.error('Error en getReports:', error);
            return res.status(500).json({ success: false, error: 'Error interno del servidor' });
        }
    }
}