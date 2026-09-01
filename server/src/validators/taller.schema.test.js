import { describe, it, expect } from 'vitest';
import { tallerActualizarSchema } from './taller.schema.js';

// Regresión del bug: un PUT desde el admin hacía que el taller desapareciera
// del catálogo público, porque "activo" llegaba como el string "true"/"false"
// (FormData, no JSON) y se guardaba tal cual en una columna INTEGER — SQLite
// no matchea WHERE activo = 1 contra el texto "true".
describe('tallerActualizarSchema - normalización de "activo"', () => {
  const base = {
    nombre: 'Taller de prueba',
    precio: '10000',
    cupos_totales: '10',
  };

  it('convierte el string "true" (FormData) a 1', () => {
    const resultado = tallerActualizarSchema.parse({ ...base, activo: 'true' });
    expect(resultado.activo).toBe(1);
  });

  it('convierte el string "false" (FormData) a 0', () => {
    const resultado = tallerActualizarSchema.parse({ ...base, activo: 'false' });
    expect(resultado.activo).toBe(0);
  });

  it('convierte un boolean real a 0/1 (por si el body llega alguna vez como JSON)', () => {
    expect(tallerActualizarSchema.parse({ ...base, activo: true }).activo).toBe(1);
    expect(tallerActualizarSchema.parse({ ...base, activo: false }).activo).toBe(0);
  });

  it('deja "activo" undefined si no viene en el body', () => {
    const resultado = tallerActualizarSchema.parse({ ...base });
    expect(resultado.activo).toBeUndefined();
  });
});
