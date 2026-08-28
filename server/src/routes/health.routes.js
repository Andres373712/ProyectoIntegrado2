import { Router } from 'express';
import { sql } from 'drizzle-orm';
import { db } from '../db/client.js';

const router = Router();

// Healthcheck simple, sin autenticación: pensado para el chequeo de salud
// de Railway (o cualquier balanceador/uptime monitor) y para el pipeline de
// CI. Además de responder, hace un SELECT trivial para confirmar que la
// base de datos SQLite sigue respondiendo — si falla, devuelve 503 en vez
// de un 200 engañoso.
router.get('/health', (req, res) => {
  try {
    db.get(sql`SELECT 1`);
    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Healthcheck falló:', error);
    res.status(503).json({ status: 'error' });
  }
});

export default router;
