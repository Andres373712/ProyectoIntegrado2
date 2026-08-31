import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { FRONTEND_URL } from './config.js';
import { UPLOADS_DIR } from './middlewares/upload.js';
import { errorHandler } from './middlewares/errorHandler.js';

import talleresRoutes from './routes/talleres.routes.js';
import productosRoutes from './routes/productos.routes.js';
import mensajesRoutes from './routes/mensajes.routes.js';
import dashboardRoutes from './routes/dashboard.routes.js';
import inscripcionRoutes from './routes/inscripcion.routes.js';
import authRoutes from './routes/auth.routes.js';
import testimoniosRoutes from './routes/testimonios.routes.js';
import clienteRoutes from './routes/cliente.routes.js';
import clientesAdminRoutes from './routes/clientes.routes.js';
import pedidoRoutes from './routes/pedido.routes.js';
import healthRoutes from './routes/health.routes.js';

export const app = express();

// Railway pone un único proxy inverso delante de este servidor. Sin esto,
// Express toma la conexión TCP directa (la del proxy) como "req.ip" para
// TODAS las requests, así que express-rate-limit contaba a todo el mundo
// junto contra el mismo cupo (10 intentos de login para el sitio entero, no
// por persona) — cualquiera podía agotarlo y bloquear el login para todos.
// El valor 1 le dice a Express "confía en un solo hop de proxy": usa la
// primera IP de X-Forwarded-For, que Railway sí controla (no la puede
// falsificar un cliente externo).
app.set('trust proxy', 1);

// Headers de seguridad estándar (X-Content-Type-Options, X-Frame-Options,
// HSTS, etc). Se relaja crossOriginResourcePolicy porque el default de
// helmet ('same-origin') bloquea que el frontend, que vive en otro origen
// (FRONTEND_URL), cargue las imágenes servidas en /uploads como <img src>:
// eso no pasa por CORS (que solo cubre fetch/XHR), sino por este header.
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());
// Los nombres de archivo son únicos por subida (uuid): el mismo nombre
// nunca cambia de contenido, así que se puede cachear de forma agresiva.
app.use('/uploads', express.static(UPLOADS_DIR, { maxAge: '1y', immutable: true }));

app.use('/api', talleresRoutes);
app.use('/api', productosRoutes);
app.use('/api', mensajesRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', inscripcionRoutes);
app.use('/api', authRoutes);
app.use('/api', testimoniosRoutes);
app.use('/api', clienteRoutes);
app.use('/api', clientesAdminRoutes);
app.use('/api', pedidoRoutes);
app.use(healthRoutes);

app.use(errorHandler);
