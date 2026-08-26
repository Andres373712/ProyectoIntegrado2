# Decisiones de arquitectura

## 0001 — Seguir con SQLite, no migrar a Postgres (26 ago 2026)

**Contexto.** La auditoría original (§05) y la iteración 2 dejaron el
backend sobre `better-sqlite3` + Drizzle ORM, con migraciones versionadas
reales. El proyecto tuvo en algún momento una `DATABASE_URL` apuntando a
un Postgres en Render (encontrada, sin uso, en `server/.env` durante la
iteración 1 de seguridad) — no hay evidencia de que ese Postgres se haya
usado nunca desde el código; probablemente quedó de un experimento o de
una plantilla inicial.

**Decisión.** Seguir con SQLite. No migrar a Postgres "por si acaso".

**Por qué.** Postgres resuelve un problema que este proyecto no tiene hoy:
escrituras concurrentes desde múltiples instancias del servidor. SQLite en
un solo archivo, con un solo proceso Node sirviendo el backend, no tiene
ese problema — y evita la complejidad operativa de gestionar una base de
datos gestionada aparte (conexión, credenciales, backups, otro servicio
que puede caerse).

**Cuándo reconsiderar esto.** Migrar a Postgres cuando se cumpla
cualquiera de estas condiciones, no antes:

- El hosting va a correr **más de una instancia** del servidor a la vez
  (auto-scaling, múltiples réplicas) — SQLite en disco local no se
  comparte entre procesos/instancias distintas.
- Se necesita separar el proceso que sirve la API del proceso que corre
  jobs/tareas en segundo plano, ambos escribiendo a la misma base.
- El volumen de escrituras concurrentes reales (no hipotético) empieza a
  producir errores `SQLITE_BUSY`/timeouts de lock en producción.
- El hosting elegido no persiste el disco entre deploys (en ese caso el
  archivo `.sqlite` se pierde igual que `server/uploads/` — ver el punto
  de object storage más abajo; probablemente ambos problemas se resuelven
  juntos, migrando a un Postgres gestionado y a almacenamiento de objetos
  para las imágenes en el mismo movimiento).

**Qué NO es una razón para migrar:** "Postgres es lo que se usa en
producción normalmente", o que ya exista una `DATABASE_URL` de un
experimento viejo. Sin una de las condiciones de arriba, migrar es
complejidad operativa nueva sin un problema real que resuelva.

**Si en el futuro se decide migrar:** Drizzle ORM ya está en el proyecto y
soporta Postgres con el mismo query builder — el cambio real es en
`server/src/db/client.js` (driver) y `server/src/db/schema.js` (algunos
tipos de columna cambian de SQLite a Postgres), no en los
repositories/services, que ya están escritos contra la API de Drizzle en
vez de SQL crudo específico de SQLite.
