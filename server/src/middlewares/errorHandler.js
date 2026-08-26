import multer from 'multer';

// Red de seguridad final: los controladores ya manejan sus propios errores
// esperados (mismos mensajes/status que antes de este refactor). Esto solo
// atrapa errores de subida de archivos y cualquier excepción no prevista,
// para no filtrar nunca un stack trace ni una respuesta en texto plano.
export function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError || err.message?.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({ message: err.message });
  }
  console.error('Error no manejado:', err);
  res.status(500).json({ message: 'Error interno del servidor.' });
}
