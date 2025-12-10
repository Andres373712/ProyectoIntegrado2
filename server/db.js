import pg from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

// Create a new pool instance.
// The pool will read the DATABASE_URL from the environment variables.
const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Test the connection
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to PostgreSQL:', err.message);
    } else {
        console.log('Connection to PostgreSQL pool established.');
    }
});


// Export the pool for use in other modules.
export const db = pool;


// Función para inicializar la base de datos (con sintaxis PG)
export async function initDb() {
    console.log('Inicializando tablas...');
    
    // Función auxiliar para ejecutar múltiples comandos SQL
    const execute = async (sql) => {
        try {
            await db.query(sql);
        } catch (error) {
            // Ignoramos errores de tablas o columnas duplicadas
            if (!error.message.includes('already exists') && !error.message.includes('duplicate column')) {
                console.error("Error al ejecutar SQL:", error.message);
            }
        }
    };

    // --- 1. CREACIÓN DE TABLAS (POSTGRESQL SYNTAX) ---
    // NOTA: SERIAL PRIMARY KEY reemplaza INTEGER PRIMARY KEY AUTOINCREMENT
    await execute(`
        CREATE TABLE IF NOT EXISTS talleres (
            id SERIAL PRIMARY KEY,
            nombre TEXT NOT NULL,
            descripcion TEXT,
            fecha TIMESTAMP,
            tipo TEXT,
            precio INTEGER,
            activo BOOLEAN DEFAULT TRUE,
            imageUrl TEXT,
            lugar TEXT,
            cupos_totales INTEGER DEFAULT 10,
            cupos_inscritos INTEGER DEFAULT 0
        );
    `);

    await execute(`
        CREATE TABLE IF NOT EXISTS productos (
            id SERIAL PRIMARY KEY,
            nombre TEXT NOT NULL,
            descripcion TEXT,
            precio INTEGER,
            stock INTEGER DEFAULT 0,
            activo BOOLEAN DEFAULT TRUE,
            imageUrl TEXT
        );
    `);

    await execute(`
        CREATE TABLE IF NOT EXISTS clientes (
            id SERIAL PRIMARY KEY,
            nombre TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            telefono TEXT,
            intereses TEXT,
            fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            password_hash TEXT,
            rol TEXT DEFAULT 'cliente',
            verificado BOOLEAN DEFAULT FALSE,
            token_verificacion TEXT UNIQUE,
            token_recuperacion TEXT,
            expiracion_recuperacion TIMESTAMP
        );
    `);
    
    // ... (otras tablas: inscripciones, notas_fidelizacion, admin) ...
    // Aquí se necesitan las tablas restantes con la sintaxis correcta (SERIAL PRIMARY KEY)
    // Usaremos la sintaxis para el resto por brevedad:
    await execute(`
        CREATE TABLE IF NOT EXISTS admin (
            id SERIAL PRIMARY KEY,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        );
    `);

    // 2. CREAR ADMIN POR DEFECTO
    try {
        const res = await db.query('SELECT * FROM admin WHERE email = $1', ['carolina@tmm.cl']);
        if (res.rows.length === 0) {
            console.log('>>> ADMIN NO ENCONTRADO. Creando uno nuevo...');
            const pass = 'tmm.admin.2025';
            const passHash = await bcrypt.hash(pass, 10);
            await db.query(
                'INSERT INTO admin (email, password_hash) VALUES ($1, $2)',
                ['carolina@tmm.cl', passHash]
            );
            console.log('=============================================');
            console.log('Administrador por defecto creado.');
            console.log('=============================================');
        }
    } catch (e) {
        console.error('Error al crear admin:', e.message);
    }
    
    console.log('Base de datos inicializada (Postgres).');
}