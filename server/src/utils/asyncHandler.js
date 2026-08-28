// Envuelve un handler async de Express para no repetir try/catch en cada
// controller: cualquier rechazo de la promesa (HttpError de negocio o error
// inesperado) se delega a next(error), que termina en el errorHandler
// central (src/middlewares/errorHandler.js).
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};
