CREATE INDEX `inscripciones_cliente_id_idx` ON `inscripciones` (`cliente_id`);--> statement-breakpoint
CREATE INDEX `inscripciones_taller_id_idx` ON `inscripciones` (`taller_id`);--> statement-breakpoint
CREATE INDEX `mensajes_contacto_fecha_creacion_idx` ON `mensajes_contacto` (`fecha_creacion`);