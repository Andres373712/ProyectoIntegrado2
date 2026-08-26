/**
 * Paginación 100% opt-in: si el caller no manda ?page y ?pageSize, esto
 * devuelve null y el endpoint se comporta exactamente igual que antes
 * (sin LIMIT, array completo) — no rompe a ningún consumidor existente.
 * Cuando sí se piden, el repositorio aplica LIMIT/OFFSET en la consulta en
 * vez de traer todo a memoria y cortar después.
 */
export function parsePaginacion(query) {
  if (query.page === undefined && query.pageSize === undefined) return null;

  const page = parseInt(query.page);
  const pageSize = parseInt(query.pageSize);
  if (Number.isNaN(page) || Number.isNaN(pageSize) || page < 1 || pageSize < 1) {
    return null;
  }

  return { page, pageSize, limit: pageSize, offset: (page - 1) * pageSize };
}
