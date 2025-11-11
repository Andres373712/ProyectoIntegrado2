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
      lugar TEXT
    );
    CREATE TABLE IF NOT EXISTS clientes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      telefono TEXT,
      intereses TEXT,
      fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
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
        console.log('Administrador por defecto creado:');
        console.log('Usuario: carolina@tmm.cl');
        console.log('Clave: tmm.admin.2025');
        console.log('=============================================');
    } else {
        console.log('>>> ADMIN SÍ FUE ENCONTRADO. No se crea uno nuevo.');
    }
  } catch (e) {
    console.error('>>> ERROR GRAVE al intentar buscar o crear admin:', e.message);
  }
  
  console.log('Base de datos lista.');
}