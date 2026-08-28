import express from 'express';
import cors from 'cors';
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
import pedidoRoutes from './routes/pedido.routes.js';

export const app = express();

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
app.use('/api', pedidoRoutes);

app.use(errorHandler);
