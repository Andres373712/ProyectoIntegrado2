import multer from 'multer';
import { HttpError } from '../utils/httpError.js';

// Red de seguridad final: los controladores que usan asyncHandler (o que ya
// no atrapan sus propios errores) delegan aquí tanto los errores de negocio
// esperados (HttpError, lanzados desde la capa de servicio) como cualquier
// excepción no prevista. También sigue atrapando errores de subida de
// archivos, para no filtrar nunca un stack trace ni una respuesta en texto
// plano.
export function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError || err.message?.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({ message: err.message });
  }
  if (err instanceof HttpError) {
    return res.status(err.status).json({ message: err.message });
  }
  console.error('Error no manejado:', err);
  res.status(500).json({ message: 'Error interno del servidor.' });
}
