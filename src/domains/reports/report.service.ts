// src/domains/reports/report.service.ts
import { AppDataSource } from '../../core/database/connection';
import { Report } from './report.entity';
import { UTR } from '../utrs/utr.entity';
import { Client } from '../clients/client.entity';

export class ReportService {
    private reportRepo = AppDataSource.getRepository(Report);
    private utrRepo = AppDataSource.getRepository(UTR);
    private clientRepo = AppDataSource.getRepository(Client);

    /**
     * VALIDACIÓN DE NOMBRE DE ARCHIVO - EXPLICADA:
     * - Extraemos componentes de nombre ségun el patrón o el tipo de nomenclatura que el reporte tenga
     * - Validamos formato de fecha (AAAAMMDD)
     * - Verificamos consistencias con datos del payload
     */
    private validateFileName(
        fileName: string, 
        reportType: string, 
        expectedRFC: string, 
        expectedNSUE: string, 
        expectedNSM?: string
    ): { isValid: boolean; date?: Date; error?: string } {
        try {
        // Remover extensión .txt y dividir por guiones bajos
        const cleanFileName = fileName.replace('.txt', '');
        const parts = cleanFileName.split('_');
        
        if (reportType === 'medidor') {
            // Patrón: RFC_AAAAMMDD_NSM_NSUE (4 partes)
            if (parts.length !== 4) {
            return { 
                    isValid: false, 
                    error: `Formato medidor requiere 4 componentes, se recibieron ${parts.length}: ${cleanFileName}` 
                };
            }
            
            const [rfc, dateStr, nsm, nsue] = parts;
            
            // Validar que expectedNSM está definido para tipo medidor
            if (expectedNSM === undefined) {
                return { isValid: false, error: 'NSM es requerido para reportes tipo medidor' };
            }
            
            // Validar coincidencia con datos del payload
            if (rfc !== expectedRFC) {
                return { isValid: false, error: `RFC no coincide: esperado ${expectedRFC}, recibido ${rfc}` };
            }
            if (nsm !== expectedNSM) {
                return { isValid: false, error: `NSM no coincide: esperado ${expectedNSM}, recibido ${nsm}` };
            }
            if (nsue !== expectedNSUE) {
                return { isValid: false, error: `NSUE no coincide: esperado ${expectedNSUE}, recibido ${nsue}` };
            }
            
            //  CORRECCIÓN: Verificar explícitamente que dateStr existe antes de parsear
            if (!dateStr) {
                return { isValid: false, error: 'Fecha no encontrada en el nombre del archivo' };
            }
            
            // Parsear fecha AAAAMMDD
            return this.parseDate(dateStr);
            
        } else if (reportType === 'sistema_medicion') {
            // Patrón: RFC_AAAAMMDD_NSUE (3 partes)
            if (parts.length !== 3) {
            return { 
                    isValid: false, 
                    error: `Formato sistema_medicion requiere 3 componentes, se recibieron ${parts.length}: ${cleanFileName}` 
                };
            }
            
            const [rfc, dateStr, nsue] = parts;
            
            if (rfc !== expectedRFC) {
                return { isValid: false, error: `RFC no coincide: esperado ${expectedRFC}, recibido ${rfc}` };
            }
            if (nsue !== expectedNSUE) {
                return { isValid: false, error: `NSUE no coincide: esperado ${expectedNSUE}, recibido ${nsue}` };
            }
            
            //  CORRECCIÓN: Verificar explícitamente que dateStr existe antes de parsear
            if (!dateStr) {
                return { isValid: false, error: 'Fecha no encontrada en el nombre del archivo' };
            }
            
            // Parsear fecha AAAAMMDD
            return this.parseDate(dateStr);
        }
        
        return { isValid: false, error: 'Tipo de reporte desconocido. Use: medidor o sistema_medicion' };
        
        } catch (error) {
            return { isValid: false, error: 'Error procesando nombre de archivo' };
        }
    }

    /**
     * PARSEAR FECHA EN FORMATO AAAAMMDD - CORREGIDA
     */
    private parseDate(dateStr: string): { isValid: boolean; date?: Date; error?: string } {
        try {
        // Validación exhaustiva del parámetro
        if (!dateStr || typeof dateStr !== 'string') {
            return { isValid: false, error: 'Fecha no proporcionada o formato inválido' };
        }

        if (dateStr.length !== 8) {
            return { isValid: false, error: 'Formato de fecha debe ser AAAAMMDD (8 dígitos)' };
        }

        const year = parseInt(dateStr.substring(0, 4));
        const month = parseInt(dateStr.substring(4, 6)) - 1; // Meses en Date son 0-based
        const day = parseInt(dateStr.substring(6, 8));

        // Validar que los números sean válidos
        if (isNaN(year) || isNaN(month) || isNaN(day)) {
            return { isValid: false, error: 'Fecha contiene caracteres no numéricos' };
        }

        // Validar rangos de fecha
        if (year < 2000 || year > 2100) {
            return { isValid: false, error: 'Año fuera de rango válido (2000-2100)' };
        }
        if (month < 0 || month > 11) {
            return { isValid: false, error: 'Mes fuera de rango válido' };
        }
        if (day < 1 || day > 31) {
            return { isValid: false, error: 'Día fuera de rango válido' };
        }

        const date = new Date(year, month, day);
        
        if (isNaN(date.getTime())) {
            return { isValid: false, error: 'Fecha inválida' };
        }

            return { isValid: true, date };
        } catch (error) {
            return { isValid: false, error: 'Error parseando fecha' };
        }
    }

    /**
     * PROCESAR UN SOLO REPORTE - EXPLICACIÓN:
     * - Validaciones múltiples en capas
     * - Manejo elegante de duplicados
     * - Transaccionoes implícitas con TypeORM
     */
    async processSingleReport(payload: any): Promise<{ success: boolean; report?: any; error?: string }> {
        try {
            console.log(`📄 Procesando reporte: ${payload.file_name}`);

        // 1. VALIDAR CAMPOS OBLIGATORIOS
        const requiredFields = ['rfc', 'nsue', 'file_name', 'content', 'report_type'];
        const missingFields = requiredFields.filter(field => !payload[field]);
        
        if (missingFields.length > 0) {
            return { 
                success: false, 
                error: `Campos obligatorios faltantes: ${missingFields.join(', ')}` 
            };
        }

        // 2. VALIDAR TIPO DE REPORTE
        if (!['medidor', 'sistema_medicion'].includes(payload.report_type)) {
            return { 
                success: false, 
                error: 'Tipo de reporte debe ser: medidor o sistema_medicion' 
            };
        }

        // 3. VALIDAR NSM PARA TIPO MEDIDOR
        if (payload.report_type === 'medidor' && !payload.nsm) {
            return {
                success: false,
                error: 'Campo nsm es obligatorio para reportes tipo medidor'
            };
        }

        // 4. BUSCAR CLIENTE POR RFC
        const client = await this.clientRepo.findOne({ 
            where: { rfc: payload.rfc } 
        });
        
        if (!client) {
            return { 
                success: false, 
                error: `Cliente con RFC ${payload.rfc} no encontrado` 
            };
        }

        // 5. BUSCAR UTR POR NSUE Y CLIENTE
        const utr = await this.utrRepo.findOne({ 
            where: { 
                nsue: payload.nsue,
                client_id: client.id
            } 
        });
        
        if (!utr) {
            return { 
                success: false, 
                error: `UTR ${payload.nsue} no encontrada para el cliente ${payload.rfc}` 
            };
        }

        // 6. VALIDAR NOMBRE DE ARCHIVO Y EXTRAER FECHA
        const validation = this.validateFileName(
            payload.file_name, 
            payload.report_type, 
            payload.rfc, 
            payload.nsue, 
            payload.nsm
        );
        
        if (!validation.isValid) {
            return { 
                success: false, 
                error: validation.error 
            };
        }

        // 7. VERIFICAR DUPLICADO (misma UTR, misma fecha, mismo tipo)
        const existingReport = await this.reportRepo.findOne({
            where: {
                utr_id: utr.id,
                generated_at: validation.date!,
                report_type: payload.report_type
            }
        });

        if (existingReport) {
            console.log(`⚠️ Reporte duplicado detectado: ${payload.file_name}`);
            // En lugar de error, marcamos como duplicado pero respondemos éxito 
            // Esto evita reintentos infinitos del software industrial
            return { 
                success: true, 
                report: { 
                    id: existingReport.id, 
                    status: 'duplicate',
                    message: 'Reporte ya existía en el sistema' 
                } 
            };
        }

        // 8. CREAR Y GUARDAR NUEVO REPORTE
        const report = this.reportRepo.create({
            utr_id: utr.id,
            client_id: client.id,
            report_type: payload.report_type,
            file_name: payload.file_name,
            file_size: Buffer.byteLength(payload.content, 'utf8'),
            content: payload.content,
            generated_at: validation.date!
        });

        const savedReport = await this.reportRepo.save(report);
        
        console.log(`✅ Reporte guardado: ${savedReport.id} - ${savedReport.file_name}`);
        
        return { 
                success: true, 
                report: {
                id: savedReport.id,
                file_name: savedReport.file_name,
                generated_at: savedReport.generated_at,
                status: 'processed'
            }
        };

        } catch (error: any) {
            console.error('❌ Error procesando reporte individual:', error);
            return { 
                success: false, 
                error: 'Error interno del servidor al procesar reporte' 
            };
        }
    }

    /**
     * PROCESAR LOTE DE REPORTES - EXPLICACIÓN
     * - Procesamiento en paralelo con Promise.all
     * - Resultados individuales por cada reporte
     * - No falla todo el lote por errores individuales 
     */
    async processBatchReports(payloads: any[]): Promise<{
        processed: number;
        duplicates: number;
        errors: number;
        results: any[];
    }> {
        console.log(`📦 Iniciando procesamiento de lote con ${payloads.length} reportes`);

        // Limitar tamaño de lote para prevenir abusos
        const limitedPayloads = payloads.slice(0, 50); // Máximo 50 reportes por lote
        
        if (payloads.length > 50) {
            console.warn(`⚠️ Lote truncado: ${payloads.length} → 50 reportes`);
        }

        const results = await Promise.all(
        limitedPayloads.map(async (payload, index) => {
            console.log(`🔄 Procesando ${index + 1}/${limitedPayloads.length}: ${payload.file_name}`);
                const result = await this.processSingleReport(payload);
                return {
                file_name: payload.file_name,
                ...result
                };
            })
        );

        // Calcular estadísticas del lote
        const stats = {
            processed: results.filter(r => r.success && r.report?.status !== 'duplicate').length,
            duplicates: results.filter(r => r.success && r.report?.status === 'duplicate').length,
            errors: results.filter(r => !r.success).length,
            results
        };

        console.log(`📊 Resumen lote: ${stats.processed} nuevos, ${stats.duplicates} duplicados, ${stats.errors} errores`);

        return stats;
    }

    /**
     * OBTENER REPORTES CON FILTRO DE ROLES Y FECHAS
     */
    async getReports(user: any, startDate?: string, endDate?: string): Promise<{success: boolean; reports?: any[]; error?: string}> {
        try {
            // Creamos un constructor de consultas (QueryBuilder)
            let query = this.reportRepo.createQueryBuilder('report');

            // Lógica de seguridad: Si NO es super_admin, solo ve los reportes de su empresa
            if (user.role !== 'super_admin' && user.role !== 'admin') {
                query.where('report.client_id = :clientId', { clientId: user.client_id });
            }

            // Aplicar filtros de fecha si el frontend los envió
            if (startDate && endDate) {
                query.andWhere('report.generated_at BETWEEN :start AND :end', { 
                    start: new Date(startDate), 
                    end: new Date(endDate) 
                });
            }

            // Ordenar de más reciente a más antiguo
            query.orderBy('report.generated_at', 'DESC');

            const reports = await query.getMany();
            return { success: true, reports };
            
        } catch (error) {
            console.error('Error obteniendo reportes:', error);
            return { success: false, error: 'Error en la base de datos al obtener reportes' };
        }
    }
}