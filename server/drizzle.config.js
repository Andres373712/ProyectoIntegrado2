import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  dialect: 'sqlite',
  schema: './src/db/schema.js',
  out: './src/db/migrations',
  dbCredentials: {
    url: './tmm_bienestar.sqlite',
  },
});
