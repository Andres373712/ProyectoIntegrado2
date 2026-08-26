import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { admin } from '../db/schema.js';

export const adminRepository = {
  getByEmail: async (email) => {
    const filas = await db.select().from(admin).where(eq(admin.email, email));
    return filas[0];
  },
};
