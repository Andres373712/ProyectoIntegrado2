import { describe, it, expect, afterAll, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import os from 'os';

// UPLOADS_DIR se calcula a partir de RAILWAY_VOLUME_MOUNT_PATH (o del propio
// directorio del middleware) en el momento del import. Se apunta a un
// directorio temporal antes de importar el módulo para no escribir nunca
// en el uploads/ real del repo durante los tests.
const TMP_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), 'upload-test-'));
process.env.RAILWAY_VOLUME_MOUNT_PATH = TMP_ROOT;
fs.mkdirSync(path.join(TMP_ROOT, 'uploads'), { recursive: true });

const { procesarImagen, UPLOADS_DIR } = await import('./upload.js');

// GIF89a válido de 1x1 píxel (transparente), el GIF real mínimo más
// conocido para pruebas.
const GIF_1x1 = Buffer.from(
  '47494638396101000100800000000000ffffff21f90401000000002c00000000010001000002024401003b',
  'hex'
);

// GIF89a válido de 1x1 con dos frames (animado), para comprobar que un GIF
// animado real se sigue aceptando y no se rompe la animación.
const GIF_ANIMADO_2_FRAMES = Buffer.from(
  '47494638396101000100800000000000ffffff21ff0b4e45545343415045322e30030100000021f9040100' +
    '0000002c00000000010001000002024401002c00000000010001000002024401003b',
  'hex'
);

// Texto plano (podría ser HTML/JS ejecutable) disfrazado de GIF: el cliente
// declara Content-Type: image/gif pero el contenido real no lo es.
const CONTENIDO_FALSO = Buffer.from(
  '<html><body><script>alert(document.cookie)</script></body></html>'
);

function crearReq(buffer) {
  return {
    file: {
      mimetype: 'image/gif',
      buffer,
    },
  };
}

function crearRes() {
  const res = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
}

describe('procesarImagen - validación real de GIF (más allá del mimetype declarado)', () => {
  afterAll(() => {
    fs.rmSync(TMP_ROOT, { recursive: true, force: true });
  });

  it('acepta y guarda tal cual un GIF real de 1 frame', async () => {
    const req = crearReq(GIF_1x1);
    const res = crearRes();
    const next = vi.fn();

    await procesarImagen(req, res, next);

    expect(next).toHaveBeenCalledWith(); // sin error
    expect(req.file.filename).toMatch(/\.gif$/);

    const destino = path.join(UPLOADS_DIR, req.file.filename);
    const guardado = fs.readFileSync(destino);
    expect(guardado.equals(GIF_1x1)).toBe(true);
  });

  it('acepta un GIF animado real (múltiples frames) sin recodificarlo', async () => {
    const req = crearReq(GIF_ANIMADO_2_FRAMES);
    const res = crearRes();
    const next = vi.fn();

    await procesarImagen(req, res, next);

    expect(next).toHaveBeenCalledWith();
    const destino = path.join(UPLOADS_DIR, req.file.filename);
    const guardado = fs.readFileSync(destino);
    // Byte a byte idéntico al original: prueba de que no pasó por el
    // pipeline de sharp (que sí reprocesa jpeg/png/webp) y de que la
    // animación no se tocó.
    expect(guardado.equals(GIF_ANIMADO_2_FRAMES)).toBe(true);
  });

  it('rechaza un archivo que declara mimetype image/gif pero no es un GIF real, y no lo escribe a disco', async () => {
    const req = crearReq(CONTENIDO_FALSO);
    const res = crearRes();
    const next = vi.fn();

    const archivosAntes = fs.readdirSync(UPLOADS_DIR).length;

    await procesarImagen(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    const errorRecibido = next.mock.calls[0][0];
    expect(errorRecibido).toBeInstanceOf(Error);
    expect(errorRecibido.message).toMatch(/no es un GIF válido/i);

    // No debe haberse creado ningún archivo nuevo en UPLOADS_DIR.
    expect(fs.readdirSync(UPLOADS_DIR).length).toBe(archivosAntes);
  });
});
