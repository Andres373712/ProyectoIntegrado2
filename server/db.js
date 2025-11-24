import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import bcrypt from 'bcryptjs';

export async function connectDb() {
  return open({
    filename: './tmm_bienestar.sqlite',
    driver: sqlite3.Database,
  });
}

export async function initDb() {
  const db = await connectDb();
  console.log('Inicializando la base de datos...');

  // 1. CREAR TODAS LAS TABLAS
  await db.exec(`
    CREATE TABLE IF NOT EXISTS talleres (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      fecha DATETIME,
      tipo TEXT,
      precio INTEGER,
      activo BOOLEAN DEFAULT true,
      imageUrl TEXT,
      lugar TEXT,
      cupos_totales INTEGER DEFAULT 10,
      cupos_inscritos INTEGER DEFAULT 0
    );
    
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      descripcion TEXT,
      precio INTEGER,
      stock INTEGER DEFAULT 0,
      activo BOOLEAN DEFAULT true,
      imageUrl TEXT
    );

    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      telefono TEXT,
      intereses TEXT,
      fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP,
      password_hash TEXT,
      rol TEXT DEFAULT 'cliente',
      verificado BOOLEAN DEFAULT false,    -- <-- NUEVO: Estado de verificación
      token_verificacion TEXT UNIQUE -- <-- NUEVO: Token para el enlace
    );
    
    CREATE TABLE IF NOT EXISTS inscripciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER,
      taller_id INTEGER,
      fecha_inscripcion DATETIME DEFAULT CURRENT_TIMESTAMP,
      token_cancelacion TEXT UNIQUE,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id),
      FOREIGN KEY (taller_id) REFERENCES talleres(id)
    );
    
    CREATE TABLE IF NOT EXISTS notas_fidelizacion (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cliente_id INTEGER NOT NULL,
        nota TEXT NOT NULL,
        fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    );
    
    CREATE TABLE IF NOT EXISTS admin (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      cliente_id INTEGER NOT NULL,
      total INTEGER NOT NULL,
      estado TEXT DEFAULT 'pendiente',
      fecha DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (cliente_id) REFERENCES clientes(id)
    );

    CREATE TABLE IF NOT EXISTS pedido_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id INTEGER NOT NULL,
      producto_id INTEGER NOT NULL,
      cantidad INTEGER NOT NULL,
      precio_unitario INTEGER NOT NULL,
      FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
      FOREIGN KEY (producto_id) REFERENCES productos(id)
    );
  `);

  

  // 2. CREAR ADMIN POR DEFECTO
  console.log('Buscando admin por defecto...');
  try {
    const admin = await db.get('SELECT * FROM admin WHERE email = ?', 'carolina@tmm.cl');
    
    if (!admin) {
        console.log('>>> ADMIN NO ENCONTRADO. Creando uno nuevo...');
        const pass = 'tmm.admin.2025';
        const passHash = await bcrypt.hash(pass, 10);
        
        await db.run(
            'INSERT INTO admin (email, password_hash) VALUES (?, ?)',
            'carolina@tmm.cl',
            passHash
        );
        console.log('=============================================');
        console.log('Administrador por defecto creado.');
        console.log('=============================================');
    }
  } catch (e) {
    console.error('>>> ERROR GRAVE al intentar buscar o crear admin:', e.message);
  }
  
  console.log('Base de datos lista.');
}