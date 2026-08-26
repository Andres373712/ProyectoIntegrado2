import 'dotenv/config';
import { app } from './src/app.js';
import { PORT } from './src/config.js';
import { ejecutarMigraciones } from './src/db/client.js';
import { sembrarAdminPorDefecto } from './src/db/seed.js';

app.listen(PORT, async () => {
  ejecutarMigraciones();
  await sembrarAdminPorDefecto();
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Imágenes: http://localhost:${PORT}/uploads`);
});
