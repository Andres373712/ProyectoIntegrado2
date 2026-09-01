import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as schema from './schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_DIR = process.env.RAILWAY_VOLUME_MOUNT_PATH || process.cwd();
const DB_PATH = path.join(DB_DIR, 'tmm_bienestar.sqlite');
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
 * migración de Drizzle, marca SOLO la migración 0000 (la que reconstruye el
 * esquema que el sistema anterior ya creaba) como ya aplicada, en vez de
 * re-ejecutar sus CREATE TABLE — evita romper una base de datos existente
 * con datos reales al adoptar el ORM.
 *
 * OJO: nunca hay que marcar aquí migraciones posteriores (0001+) — esas son
 * cambios reales (ej. índices nuevos) que sí deben ejecutarse contra
 * cualquier base de datos, baseline-ada o no. Antes este bug marcaba TODO
 * el journal como aplicado, incluyendo migraciones que nunca corrieron de
 * verdad (detectado al probar contra una DB "legacy" simulada).
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
  const migracionInicial = journal.entries.find((entry) => entry.idx === 0);
  if (!migracionInicial) return;

  const sqlFile = fs.readFileSync(
    path.join(MIGRATIONS_FOLDER, `${migracionInicial.tag}.sql`),
    'utf-8',
  );
  const hash = crypto.createHash('sha256').update(sqlFile).digest('hex');
  sqlite
    .prepare(`INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)`)
    .run(hash, migracionInicial.when);
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

/**
 * Red de seguridad para filas de "talleres" guardadas antes del fix de
 * tallerActualizarSchema: cualquier PUT hecho mientras "activo" no se
 * coercionaba pudo dejar el string crudo "true"/"false" en una columna
 * INTEGER, con lo que WHERE activo = 1 deja de matchear esa fila y el taller
 * desaparece del catálogo público sin ningún error visible. Se corre en cada
 * arranque, es idempotente (no toca filas que ya son INTEGER) y no depende
 * de una migración de Drizzle porque no cambia el esquema, solo los datos.
 */
function normalizarActivoDeTalleres() {
  const corregidas = sqlite
    .prepare(
      `UPDATE talleres
       SET activo = CASE WHEN lower(trim(activo)) IN ('true', '1') THEN 1 ELSE 0 END
       WHERE typeof(activo) != 'integer'`,
    )
    .run();
  if (corregidas.changes > 0) {
    console.log(
      `Normalizadas ${corregidas.changes} fila(s) de 'talleres' con 'activo' guardado como texto.`,
    );
  }
}

/**
 * Red de seguridad para filas escritas antes de que cada repositorio fijara
 * su columna de fecha explícitamente (ver comentario en
 * pedidosRepository.crear): el default de esas columnas en schema.js era la
 * cadena literal 'CURRENT_TIMESTAMP', no la función SQL homónima, así que
 * quedaron con ese texto en vez de una fecha real. No hay forma de recuperar
 * la fecha original, así que se reemplaza por el momento de este fix — sigue
 * siendo estrictamente mejor que un string no parseable como fecha. Se corre
 * en cada arranque e idempotente (el WHERE solo agarra filas todavía rotas).
 */
function normalizarFechasLiterales() {
  const ahora = new Date().toISOString();
  const objetivos = [
    { tabla: 'clientes', columna: 'fecha_registro' },
    { tabla: 'inscripciones', columna: 'fecha_inscripcion' },
    { tabla: 'mensajes_contacto', columna: 'fecha_creacion' },
    { tabla: 'testimonios', columna: 'fecha_creacion' },
  ];
  for (const { tabla, columna } of objetivos) {
    if (!tablaExiste(tabla)) continue;
    const corregidas = sqlite
      .prepare(`UPDATE "${tabla}" SET "${columna}" = ? WHERE "${columna}" = 'CURRENT_TIMESTAMP'`)
      .run(ahora);
    if (corregidas.changes > 0) {
      console.log(`Normalizadas ${corregidas.changes} fila(s) de '${tabla}.${columna}' con fecha literal.`);
    }
  }
}

export function ejecutarMigraciones() {
  if (tablaExiste('talleres')) {
    baselinearMigracionInicialSiHaceFalta();
  }
  migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  agregarColumnaAceptaTerminosSiFalta();
  if (tablaExiste('talleres')) {
    normalizarActivoDeTalleres();
  }
  normalizarFechasLiterales();
}

export function cerrarConexion() {
  sqlite.close();
}
