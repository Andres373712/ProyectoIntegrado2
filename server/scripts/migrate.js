import fs from 'fs';
import csv from 'csv-parser';
import { connectDb } from '../db.js'; // Verifica esta ruta

// Ruta al archivo que vamos a importar
const filePath = './scripts/migracion.csv';

// Función principal del script
async function runMigration() {
    console.log('🚀 Iniciando migración de datos desde CSV...');

    const db = await connectDb();
    const results = [];

    fs.createReadStream(filePath)
        .pipe(csv()) // Asumiendo que la primera fila SÍ son los encabezados
        .on('data', (data) => {
            const clienta = {
                // Usa el encabezado EXACTO de tu CSV
                nombre: data['NOMBRE '] || null, 
                email: null, 
                telefono: null,
                intereses: null, 
            };
            if (clienta.nombre) {
                results.push(clienta);
            }
        })
        .on('end', async () => {
            console.log(`Se procesaron ${results.length} filas con nombre del archivo CSV.`);
            let nuevasClientas = 0;
            let filasSaltadas = 0;
            const emailsUnicos = new Set(); 

            for (const clienta of results) {
                // Generar email temporal único
                const emailTemporal = `${clienta.nombre.trim().replace(/\s+/g, '.').toLowerCase()}@tmm-temporal.cl`;

                if (emailsUnicos.has(emailTemporal)) {
                    console.warn(`Saltando nombre duplicado (mismo email temporal): ${clienta.nombre}`);
                    filasSaltadas++;
                    continue;
                }

                try {
                    const existente = await db.get('SELECT id FROM clientes WHERE email = ?', emailTemporal);

                    if (existente) {
                        filasSaltadas++;
                    } else {
                        await db.run(
                            'INSERT INTO clientes (nombre, email, telefono, intereses) VALUES (?, ?, ?, ?)',
                            clienta.nombre.trim(),
                            emailTemporal,
                            clienta.telefono, // null
                            clienta.intereses // null
                        );
                        nuevasClientas++;
                        emailsUnicos.add(emailTemporal); 
                    }
                } catch (e) {
                    console.error(`Error procesando a ${clienta.nombre}: ${e.message}`);
                    filasSaltadas++;
                }
            }

            console.log('--- Resumen de la Migración ---');
            console.log(`✅ ${nuevasClientas} clientas nuevas fueron importadas (con email temporal).`);
            console.log(`🚫 ${filasSaltadas} filas fueron saltadas (sin nombre, duplicadas o con error).`);
            console.log('IMPORTANTE: Revisa y corrige los emails temporales en el panel de administración.');
            console.log('🎉 ¡Migración completada!');
        });
}

// Ejecutar la función
runMigration();
