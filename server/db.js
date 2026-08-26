import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

let dbInstance; // This will hold the promise that resolves to the db object

// This function ensures the database is opened only once.
async function getDb() {
    if (!dbInstance) {
        dbInstance = await open({
            filename: './tmm_bienestar.sqlite', // Database file
            driver: sqlite3.verbose().Database
        });
        console.log('Connection to SQLite has been established.');
    }
    return dbInstance;
}

// The exported db object mimics the pg pool interface to minimize code changes elsewhere.
export const db = {
  query: async (sql, params = []) => {
    const connection = await getDb();
    
    // This is a more robust implementation. Instead of replacing placeholders in the SQL string,
    // we transform the `params` array into a named parameter object that the `sqlite` library understands.
    // e.g., for SQL with $1, $2 and params ['a', 'b'], this creates { '$1': 'a', '$2': 'b' }.
    // This is much safer and handles out-of-order placeholders correctly.
    const paramObject = {};
    if (params.length > 0) {
      // Find all placeholders like $1, $10, etc., in the SQL string
      const placeholders = sql.match(/\$\d+/g) || [];
      placeholders.forEach(placeholder => {
        // Get the number from the placeholder (e.g., '1' from '$1')
        const index = parseInt(placeholder.substring(1), 10) - 1;
        if (index >= 0 && index < params.length) {
          paramObject[placeholder] = params[index];
        }
      });
    }

    try {
      if (sql.trim().toUpperCase().startsWith('SELECT')) {
        const rows = await connection.all(sql, paramObject);
        return { rows, rowCount: rows.length };
      } else {
        const result = await connection.run(sql, paramObject);
        return { rows: [], rowCount: result.changes, lastID: result.lastID };
      }
    } catch (error) {
      console.error('SQLite Error executing query:', error.message);
      console.error('SQL:', sql);
      console.error('Params:', paramObject);
      throw error;
    }
  },
  // Add a close method for graceful shutdown if needed
    close: async () => {
        if (dbInstance) {
            const connection = await getDb();
            await connection.close();
            dbInstance = null;
            console.log('SQLite connection closed.');
        }
    }
};

// Función para inicializar la base de datos (con sintaxis PG)
export async function initDb() {
    console.log('Initializing SQLite database tables...');
    
    // The getDb() call will open the database if it's not already open.
    await getDb();

    // Función auxiliar para ejecutar múltiples comandos SQL
    const execute = async (sql, ignoreExists = true) => {
        try {
            await db.query(sql);
        } catch (error) {
            // Solo ignoramos errores de "ya existe" si se especifica
            if (ignoreExists && (error.message.includes('already exists') || error.message.includes('duplicate column'))) {
                return; // Es un error esperado, continuamos
            }
            // Para cualquier otro error, lo lanzamos para detener la inicialización
            console.error("Critical error during SQL execution in initDb:", error.message);
            throw error;
        }
    };

    try {
        // --- 1. TABLE CREATION (SQLITE SYNTAX) ---
        // NOTE: INTEGER PRIMARY KEY AUTOINCREMENT replaces SERIAL PRIMARY KEY
        // NOTE: BOOLEAN is replaced by INTEGER (0 for false, 1 for true)
        // NOTE: TIMESTAMP is replaced by DATETIME
        await execute(`
        CREATE TABLE IF NOT EXISTS talleres (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            descripcion TEXT,
            fecha DATETIME,
            tipo TEXT,
            precio INTEGER,
            activo INTEGER DEFAULT 1,
            imageurl TEXT,
            lugar TEXT,
            cupos_totales INTEGER DEFAULT 10,
            cupos_inscritos INTEGER DEFAULT 0
        );
        `);

        await execute(`
        CREATE TABLE IF NOT EXISTS productos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            descripcion TEXT,
            precio INTEGER,
            stock INTEGER DEFAULT 0,
            activo INTEGER DEFAULT 1,
            imageurl TEXT
        );
        `);

        await execute(`
        CREATE TABLE IF NOT EXISTS clientes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            telefono TEXT,
            intereses TEXT,
            fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
            password_hash TEXT,
            rol TEXT DEFAULT 'cliente',
            verificado INTEGER DEFAULT 0,
            token_verificacion TEXT UNIQUE,
            token_recuperacion TEXT,
            expiracion_recuperacion DATETIME,
            acepta_terminos INTEGER
        );
        `);

        // Migration for 'acepta_terminos' is implicitly handled by CREATE TABLE IF NOT EXISTS
        // but we can add it explicitly for existing dbs from a previous state.
        try {
            await db.query('SELECT acepta_terminos FROM clientes LIMIT 1');
        } catch (e) {
            if (e.message.includes('no such column')) {
                console.log("Migrating 'clientes' table: adding 'acepta_terminos' column...");
                await db.query('ALTER TABLE clientes ADD COLUMN acepta_terminos INTEGER;');
            }
        }

        await execute(`
        CREATE TABLE IF NOT EXISTS inscripciones (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente_id INTEGER REFERENCES clientes(id),
            taller_id INTEGER REFERENCES talleres(id) ON DELETE CASCADE,
            fecha_inscripcion DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(cliente_id, taller_id)
        );
        `);

        await execute(`
        CREATE TABLE IF NOT EXISTS mensajes_contacto (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nombre TEXT NOT NULL,
            email TEXT NOT NULL,
            telefono TEXT,
            mensaje TEXT NOT NULL,
            fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
            leido INTEGER DEFAULT 0
        );
        `);

        await execute(`
        CREATE TABLE IF NOT EXISTS notas_fidelizacion (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente_id INTEGER REFERENCES clientes(id) ON DELETE CASCADE,
            nota TEXT NOT NULL,
            fecha DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        `);

        await execute(`
        CREATE TABLE IF NOT EXISTS pedidos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            cliente_id INTEGER REFERENCES clientes(id),
            total INTEGER NOT NULL,
            estado TEXT DEFAULT 'pendiente',
            fecha_pedido DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        `);

        await execute(`
        CREATE TABLE IF NOT EXISTS pedido_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
            producto_id INTEGER REFERENCES productos(id),
            cantidad INTEGER NOT NULL,
            precio_unitario INTEGER NOT NULL
        );
        `);

        await execute(`
        CREATE TABLE IF NOT EXISTS admin (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL
        );
        `);

        // 2. CREAR ADMIN POR DEFECTO
        const res = await db.query('SELECT * FROM admin WHERE email = $1', ['carolina@tmm.cl']);
        if (res.rows.length === 0) {
            console.log('>>> ADMIN NOT FOUND. Creating a new one...');
            const pass = process.env.DEFAULT_ADMIN_PASSWORD || 'tmm.admin.2025';
            if (pass === 'tmm.admin.2025') {
                console.warn('WARNING: Using default admin password. Set DEFAULT_ADMIN_PASSWORD in your .env file.');
            }
            const passHash = await bcrypt.hash(pass, 10);
            await db.query(
                'INSERT INTO admin (email, password_hash) VALUES ($1, $2)',
                ['carolina@tmm.cl', passHash]
            );
            console.log('=============================================');
            console.log('Default administrator created.');
            console.log('=============================================');
        }

        console.log('Database initialized (SQLite).');

    } catch (initError) {
        console.error('FATAL: Could not initialize the database. The application will close.');
        console.error(initError);
        process.exit(1); // Detiene la aplicación con un código de error
    }
}