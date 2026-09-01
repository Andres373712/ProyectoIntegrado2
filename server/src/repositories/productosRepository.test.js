import { describe, it, expect, vi } from 'vitest';

// Mismo patrón que talleresRepository.test.js: SQLite real en memoria con el
// esquema real migrado, en vez de mockear el repositorio.
let db;
vi.mock('../db/client.js', async () => {
  const { crearDbDePrueba } = await import('./testDb.js');
  ({ db } = crearDbDePrueba());
  return { db: new Proxy({}, { get: (_t, prop) => db[prop] }) };
});

const { productosRepository } = await import('./productosRepository.js');
const { productos } = await import('../db/schema.js');

async function crearProducto(overrides = {}) {
  const resultado = await db
    .insert(productos)
    .values({ nombre: 'Kit de prueba', precio: 10000, stock: 5, activo: 1, ...overrides })
    .returning({ id: productos.id });
  return resultado[0].id;
}

describe('productosRepository.descontarStock — contra SQLite real', () => {
  it('descuenta stock cuando alcanza', async () => {
    const id = await crearProducto({ stock: 5 });
    const resultado = productosRepository.descontarStock(id, 3);
    expect(resultado.changes).toBe(1);
    const fila = await productosRepository.getById(id);
    expect(fila.stock).toBe(2);
  });

  it('no descuenta si no alcanza el stock (WHERE atómico, no un chequeo aparte)', async () => {
    const id = await crearProducto({ stock: 2 });
    const resultado = productosRepository.descontarStock(id, 5);
    expect(resultado.changes).toBe(0);
    const fila = await productosRepository.getById(id);
    expect(fila.stock).toBe(2); // sin cambios
  });

  it('descuenta exactamente hasta 0 cuando el stock alcanza justo', async () => {
    const id = await crearProducto({ stock: 3 });
    const resultado = productosRepository.descontarStock(id, 3);
    expect(resultado.changes).toBe(1);
    const fila = await productosRepository.getById(id);
    expect(fila.stock).toBe(0);
  });
});
