import pg from 'pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

// Create a new pool instance.
// The pool will read the DATABASE_URL from the environment variables.
const { Pool } = pg;
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
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
            expiracion_recuperacion TIMESTAMP,
            acepta_terminos BOOLEAN
        );
    `);

    // --- MIGRACIÓN: Añadir columna acepta_terminos si no existe ---
    await execute(`
        ALTER TABLE clientes ADD COLUMN IF NOT EXISTS acepta_terminos BOOLEAN;
    `);

    await execute(`
        CREATE TABLE IF NOT EXISTS inscripciones (
            id SERIAL PRIMARY KEY,
            cliente_id INTEGER REFERENCES clientes(id),
            taller_id INTEGER REFERENCES talleres(id) ON DELETE CASCADE,
            fecha_inscripcion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(cliente_id, taller_id)
        );
    `);

    await execute(`
        CREATE TABLE IF NOT EXISTS mensajes_contacto (
            id SERIAL PRIMARY KEY,
            nombre TEXT NOT NULL,
            email TEXT NOT NULL,
            telefono TEXT,
            mensaje TEXT NOT NULL,
            fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            leido BOOLEAN DEFAULT FALSE
        );
    `);

    await execute(`
        CREATE TABLE IF NOT EXISTS notas_fidelizacion (
            id SERIAL PRIMARY KEY,
            cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
            nota TEXT NOT NULL,
            fecha TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await execute(`
        CREATE TABLE IF NOT EXISTS pedidos (
            id SERIAL PRIMARY KEY,
            cliente_id INTEGER REFERENCES clientes(id),
            total INTEGER NOT NULL,
            estado VARCHAR(50) DEFAULT 'pendiente',
            fecha_pedido TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    await execute(`
        CREATE TABLE IF NOT EXISTS pedido_items (
            id SERIAL PRIMARY KEY,
            pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
            producto_id INTEGER REFERENCES productos(id),
            cantidad INTEGER NOT NULL,
            precio_unitario INTEGER NOT NULL
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
            const pass = process.env.DEFAULT_ADMIN_PASSWORD || 'tmm.admin.2025';
            if (pass === 'tmm.admin.2025') {
                console.warn('ADVERTENCIA: Usando contraseña de administrador por defecto. Defina DEFAULT_ADMIN_PASSWORD en su archivo .env');
            }
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