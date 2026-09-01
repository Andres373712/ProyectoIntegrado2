import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import path from 'path';
import { fileURLToPath } from 'url';
import * as schema from '../db/schema.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MIGRATIONS_FOLDER = path.join(__dirname, '../db/migrations');

// SQLite real en memoria, con el esquema real aplicado corriendo las mismas
// migraciones de Drizzle que se usan en producción — no una copia a mano del
// esquema, que podría desincronizarse. Existe para poder testear los
// repositorios contra SQL de verdad (afinidad de tipos, UPDATE atómicos,
// índices únicos, constraints de FK) en vez de mockear el repositorio mismo,
// que es lo único que hacían los tests de servicio hasta ahora.
export function crearDbDePrueba() {
  const sqlite = new Database(':memory:');
  sqlite.pragma('foreign_keys = ON');
  const db = drizzle(sqlite, { schema });
  migrate(db, { migrationsFolder: MIGRATIONS_FOLDER });
  return { db, sqlite };
}
