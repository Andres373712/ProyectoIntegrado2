import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const UPLOADS_DIR = path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH || path.join(__dirname, '..', '..'), 'uploads');

const EXTENSIONES_PERMITIDAS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
};

const ANCHO_MAXIMO = 1600;
const CALIDAD = 82;

// Buffer en memoria en vez de escribir directo a disco: el archivo se
// procesa con sharp (resize + compresión) antes de guardarse.
const storage = multer.memoryStorage();

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (EXTENSIONES_PERMITIDAS[file.mimetype]) return cb(null, true);
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes JPG, PNG, WEBP o GIF.'));
  },
});

/**
 * Redimensiona (máx. 1600px de ancho, sin agrandar imágenes chicas) y
 * comprime la imagen subida antes de guardarla — antes se guardaba el
 * archivo tal cual llegaba del cliente, sin importar su peso original.
 *
 * Los GIF se copian sin tocar: podrían ser animados, y sharp solo procesa
 * el primer frame por defecto (convertirlos rompería la animación).
 */
export async function procesarImagen(req, res, next) {
  if (!req.file) return next();

  try {
    const ext = EXTENSIONES_PERMITIDAS[req.file.mimetype] || '';
    const filename = `${Date.now()}-${uuidv4()}${ext}`;
    const destino = path.join(UPLOADS_DIR, filename);

    if (req.file.mimetype === 'image/gif') {
      await fs.promises.writeFile(destino, req.file.buffer);
    } else {
      let pipeline = sharp(req.file.buffer).resize({
        width: ANCHO_MAXIMO,
        withoutEnlargement: true,
      });
      if (req.file.mimetype === 'image/jpeg') pipeline = pipeline.jpeg({ quality: CALIDAD });
      else if (req.file.mimetype === 'image/png') pipeline = pipeline.png({ quality: CALIDAD });
      else if (req.file.mimetype === 'image/webp') pipeline = pipeline.webp({ quality: CALIDAD });
      await pipeline.toFile(destino);
    }

    req.file.filename = filename;
    next();
  } catch (error) {
    next(error);
  }
}
