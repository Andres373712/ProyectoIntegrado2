import { db } from '../db/client.js';
import { inscripciones } from '../db/schema.js';

export const inscripcionesRepository = {
  crear: ({ clienteId, tallerId }) =>
    db.insert(inscripciones).values({ cliente_id: clienteId, taller_id: tallerId }),
};
