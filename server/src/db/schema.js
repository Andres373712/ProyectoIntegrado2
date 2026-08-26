import { sqliteTable, integer, text, index } from 'drizzle-orm/sqlite-core';

// Refleja exactamente las tablas creadas hoy en server/db.js (mismos nombres
// de columna, incl. "imageurl" en minúscula) — no es un rediseño de esquema.

export const talleres = sqliteTable('talleres', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull(),
  descripcion: text('descripcion'),
  fecha: text('fecha'),
  tipo: text('tipo'),
  precio: integer('precio'),
  // Se mantiene como entero plano (no modo "boolean" de Drizzle): la ruta de
  // actualización hoy escribe el valor crudo que llega del formulario.
  activo: integer('activo').default(1),
  imageurl: text('imageurl'),
  lugar: text('lugar'),
  cupos_totales: integer('cupos_totales').default(10),
  cupos_inscritos: integer('cupos_inscritos').default(0),
});

export const productos = sqliteTable('productos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull(),
  descripcion: text('descripcion'),
  precio: integer('precio'),
  stock: integer('stock').default(0),
  activo: integer('activo').default(1),
  imageurl: text('imageurl'),
});

export const clientes = sqliteTable('clientes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull(),
  email: text('email').notNull().unique(),
  telefono: text('telefono'),
  intereses: text('intereses'),
  fecha_registro: text('fecha_registro').default('CURRENT_TIMESTAMP'),
  password_hash: text('password_hash'),
  rol: text('rol').default('cliente'),
  verificado: integer('verificado').default(0),
  token_verificacion: text('token_verificacion').unique(),
  token_recuperacion: text('token_recuperacion'),
  expiracion_recuperacion: text('expiracion_recuperacion'),
  acepta_terminos: integer('acepta_terminos'),
});

export const inscripciones = sqliteTable(
  'inscripciones',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    cliente_id: integer('cliente_id').references(() => clientes.id),
    taller_id: integer('taller_id').references(() => talleres.id),
    fecha_inscripcion: text('fecha_inscripcion').default('CURRENT_TIMESTAMP'),
  },
  (table) => [
    index('inscripciones_cliente_id_idx').on(table.cliente_id),
    index('inscripciones_taller_id_idx').on(table.taller_id),
  ],
);

export const mensajesContacto = sqliteTable(
  'mensajes_contacto',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    nombre: text('nombre').notNull(),
    email: text('email').notNull(),
    telefono: text('telefono'),
    mensaje: text('mensaje').notNull(),
    fecha_creacion: text('fecha_creacion').default('CURRENT_TIMESTAMP'),
    leido: integer('leido').default(0),
  },
  (table) => [index('mensajes_contacto_fecha_creacion_idx').on(table.fecha_creacion)],
);

export const notasFidelizacion = sqliteTable('notas_fidelizacion', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cliente_id: integer('cliente_id').references(() => clientes.id),
  nota: text('nota').notNull(),
  fecha: text('fecha').default('CURRENT_TIMESTAMP'),
});

export const pedidos = sqliteTable('pedidos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  cliente_id: integer('cliente_id').references(() => clientes.id),
  total: integer('total').notNull(),
  estado: text('estado').default('pendiente'),
  fecha_pedido: text('fecha_pedido').default('CURRENT_TIMESTAMP'),
});

export const pedidoItems = sqliteTable('pedido_items', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  pedido_id: integer('pedido_id').references(() => pedidos.id),
  producto_id: integer('producto_id').references(() => productos.id),
  cantidad: integer('cantidad').notNull(),
  precio_unitario: integer('precio_unitario').notNull(),
});

export const testimonios = sqliteTable('testimonios', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  nombre: text('nombre').notNull(),
  curso: text('curso'),
  comentario: text('comentario').notNull(),
  calificacion: integer('calificacion').default(5),
  activo: integer('activo').default(1),
  fecha_creacion: text('fecha_creacion').default('CURRENT_TIMESTAMP'),
});

export const admin = sqliteTable('admin', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
});
