CREATE TABLE `testimonios` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`curso` text,
	`comentario` text NOT NULL,
	`calificacion` integer DEFAULT 5,
	`activo` integer DEFAULT 1,
	`fecha_creacion` text DEFAULT 'CURRENT_TIMESTAMP'
);
