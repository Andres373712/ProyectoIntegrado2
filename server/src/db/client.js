import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as schema from './schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(process.cwd(), 'tmm_bienestar.sqlite');
const MIGRATIONS_FOLDER = path.join(__dirname, 'migrations');

const sqlite = new Database(DB_PATH);
sqlite.pragma('foreign_keys = ON');

export const db = drizzle(sqlite, { schema });

function tablaExiste(nombre) {
  const row = sqlite
    .prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name = ?`)
    .get(nombre);
  return !!row;
}

/**
 * Si la base de datos ya tiene las tablas creadas por el sistema anterior
 * (CREATE TABLE IF NOT EXISTS en el viejo db.js) pero nunca corrió una
 * migración de Drizzle, marca la migración inicial como ya aplicada en vez
 * de re-ejecutar los CREATE TABLE — evita romper una base de datos existente
 * con datos reales al adoptar el ORM.
 */
function baselinearMigracionInicialSiHaceFalta() {
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS __drizzle_migrations (
      id SERIAL PRIMARY KEY,
      hash text NOT NULL,
      created_at numeric
    )
  `);
  const yaHayRegistro = sqlite.prepare(`SELECT id FROM __drizzle_migrations LIMIT 1`).get();
  if (yaHayRegistro) return;

  const journal = JSON.parse(
    fs.readFileSync(path.join(MIGRATIONS_FOLDER, 'meta/_journal.json'), 'utf-8')
  );
  const insertar = sqlite.prepare(
    `INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)`
  );
  for (const entry of journal.entries) {
    const sqlFile = fs.readFileSync(path.join(MIGRATIONS_FOLDER, `${entry.tag}.sql`), 'utf-8');
    const hash = crypto.createHash('sha256').update(sqlFile).digest('hex');
    insertar.run(hash, entry.when);
  }
}

/**
 * Red de seguridad heredada del db.js anterior: bases de datos viejas
 * (previas a que existiera esta columna) pueden no tener "acepta_terminos"
 * en clientes aunque ya se las haya "baseline-ado" como migradas.
 */
function agregarColumnaAceptaTerminosSiFalta() {
  const columnas = sqlite.prepare(`PRAGMA table_info(clientes)`).all();
  const yaExiste = columnas.some((c) => c.name === 'acepta_terminos');
  if (!yaExiste) {
    console.log("Migrando tabla 'clientes': agregando columna 'acepta_terminos'...");
    sqlite.exec(`ALTER TABLE clientes ADD COLUMN acepta_terminos INTEGER;`);
  }
}

export function ejecutarMigraciones() {
  if (tablaExiste('talleres')) {
    baselinearMigracionInicialSiHaceFalta();
  }
  migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  agregarColumnaAceptaTerminosSiFalta();
}

export function cerrarConexion() {
  sqlite.close();
}
