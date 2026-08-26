import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { eq } from 'drizzle-orm';
import { db } from './client.js';
import { admin } from './schema.js';

const ADMIN_EMAIL = 'carolina@tmm.cl';

export async function sembrarAdminPorDefecto() {
  const existente = await db.select().from(admin).where(eq(admin.email, ADMIN_EMAIL));
  if (existente.length > 0) return;

  console.log('>>> ADMIN NOT FOUND. Creating a new one...');
  const passGenerada = !process.env.DEFAULT_ADMIN_PASSWORD;
  const pass = process.env.DEFAULT_ADMIN_PASSWORD || crypto.randomBytes(12).toString('base64url');
  const passHash = await bcrypt.hash(pass, 10);

  await db.insert(admin).values({ email: ADMIN_EMAIL, password_hash: passHash });

  console.log('=============================================');
  console.log('Default administrator created.');
  if (passGenerada) {
    console.log(`Contraseña generada (guárdala, no se volverá a mostrar): ${pass}`);
    console.log('Define DEFAULT_ADMIN_PASSWORD en .env para fijar una contraseña propia.');
  }
  console.log('=============================================');
}
