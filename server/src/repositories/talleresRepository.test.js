import { describe, it, expect, vi } from 'vitest';

// talleresRepository importa `db` como binding nombrado desde db/client.js;
// se mockea el módulo completo para que apunte a una base SQLite real en
// memoria (con el esquema real migrado) en vez de al archivo .sqlite del
// proyecto. Una sola base para todo el archivo — los tests usan filas
// propias con ids conocidos en vez de depender de que la tabla esté vacía.
let db;
vi.mock('../db/client.js', async () => {
  const { crearDbDePrueba } = await import('./testDb.js');
  ({ db } = crearDbDePrueba());
  return { db: new Proxy({}, { get: (_t, prop) => db[prop] }) };
});

const { talleresRepository } = await import('./talleresRepository.js');
const { talleres } = await import('../db/schema.js');

async function crearTaller(overrides = {}) {
  const resultado = await db
    .insert(talleres)
    .values({
      nombre: 'Taller de prueba',
      activo: 1,
      cupos_totales: 3,
      cupos_inscritos: 0,
      ...overrides,
    })
    .returning({ id: talleres.id });
  return resultado[0].id;
}

describe('talleresRepository — contra SQLite real', () => {
  it('crear + getById hacen el round-trip de imageurl -> imageUrl vía el service, pero acá se verifica la columna real', async () => {
    const id = await crearTaller({ imageurl: '/uploads/foto.jpg' });
    const fila = await talleresRepository.getById(id);
    expect(fila.imageurl).toBe('/uploads/foto.jpg');
  });

  describe('incrementarCuposInscritos', () => {
    it('incrementa y devuelve true si queda cupo', async () => {
      const id = await crearTaller({ cupos_totales: 3, cupos_inscritos: 1 });
      const ok = talleresRepository.incrementarCuposInscritos(id);
      expect(ok).toBe(true);
      const fila = await talleresRepository.getById(id);
      expect(fila.cupos_inscritos).toBe(2);
    });

    it('no incrementa y devuelve false si ya no queda cupo (WHERE atómico, no un chequeo aparte)', async () => {
      const id = await crearTaller({ cupos_totales: 2, cupos_inscritos: 2 });
      const ok = talleresRepository.incrementarCuposInscritos(id);
      expect(ok).toBe(false);
      const fila = await talleresRepository.getById(id);
      expect(fila.cupos_inscritos).toBe(2); // sin cambios
    });

    it('trata cupos_totales = 0 como "sin configurar" (COALESCE a 10), no como cero cupos', async () => {
      // Documenta el comportamiento actual (mencionado en la auditoría de
      // arquitectura): un taller con cupos_totales=0 acepta hasta 10
      // inscripciones porque la condición usa COALESCE(NULLIF(...,0), 10).
      const id = await crearTaller({ cupos_totales: 0, cupos_inscritos: 0 });
      const ok = talleresRepository.incrementarCuposInscritos(id);
      expect(ok).toBe(true);
    });
  });

  describe('decrementarCuposInscritos', () => {
    it('decrementa normalmente', async () => {
      const id = await crearTaller({ cupos_inscritos: 2 });
      const ok = talleresRepository.decrementarCuposInscritos(id);
      expect(ok).toBe(true);
      const fila = await talleresRepository.getById(id);
      expect(fila.cupos_inscritos).toBe(1);
    });

    it('no baja de 0 (MAX(cupos_inscritos - 1, 0))', async () => {
      const id = await crearTaller({ cupos_inscritos: 0 });
      talleresRepository.decrementarCuposInscritos(id);
      const fila = await talleresRepository.getById(id);
      expect(fila.cupos_inscritos).toBe(0);
    });
  });

  // Regresión del bug real de producción: taller.schema.js coerciona
  // "activo" a 0/1 antes de llegar acá (ver taller.schema.test.js) — este
  // test prueba la otra mitad: que un entero real 0/1 efectivamente incluye
  // o excluye la fila del listado público a través de SQLite de verdad.
  describe('activo y getActivos (bug de producción: PUT ocultaba el taller)', () => {
    it('un taller con activo=1 aparece en getActivos', async () => {
      const id = await crearTaller({ nombre: 'Yoga visible', activo: 1 });
      await talleresRepository.actualizar(id, { activo: 1, nombre: 'Yoga visible' });
      const activos = await talleresRepository.getActivos();
      expect(activos.some((t) => t.id === id)).toBe(true);
    });

    it('un taller actualizado con activo=0 desaparece de getActivos', async () => {
      const id = await crearTaller({ nombre: 'Yoga que se oculta', activo: 1 });
      await talleresRepository.actualizar(id, { activo: 0, nombre: 'Yoga que se oculta' });
      const activos = await talleresRepository.getActivos();
      expect(activos.some((t) => t.id === id)).toBe(false);
    });
  });
});
