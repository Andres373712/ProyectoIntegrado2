import { eq, desc } from 'drizzle-orm';
import { db } from '../db/client.js';
import { notasFidelizacion } from '../db/schema.js';

export const notasFidelizacionRepository = {
  getPorClienteId: (clienteId) =>
    db
      .select()
      .from(notasFidelizacion)
      .where(eq(notasFidelizacion.cliente_id, clienteId))
      .orderBy(desc(notasFidelizacion.id)),

  // fecha se fija acá explícitamente (mismo motivo que pedidosRepository.crear
  // con fecha_pedido): el default de schema.js es la cadena literal
  // 'CURRENT_TIMESTAMP', no la función SQL homónima.
  crear: ({ clienteId, nota }) =>
    db.insert(notasFidelizacion).values({ cliente_id: clienteId, nota, fecha: new Date().toISOString() }),
};
