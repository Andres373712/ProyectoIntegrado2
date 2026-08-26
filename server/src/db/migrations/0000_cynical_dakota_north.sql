CREATE TABLE `admin` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `admin_email_unique` ON `admin` (`email`);--> statement-breakpoint
CREATE TABLE `clientes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`email` text NOT NULL,
	`telefono` text,
	`intereses` text,
	`fecha_registro` text DEFAULT 'CURRENT_TIMESTAMP',
	`password_hash` text,
	`rol` text DEFAULT 'cliente',
	`verificado` integer DEFAULT 0,
	`token_verificacion` text,
	`token_recuperacion` text,
	`expiracion_recuperacion` text,
	`acepta_terminos` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `clientes_email_unique` ON `clientes` (`email`);--> statement-breakpoint
CREATE UNIQUE INDEX `clientes_token_verificacion_unique` ON `clientes` (`token_verificacion`);--> statement-breakpoint
CREATE TABLE `inscripciones` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cliente_id` integer,
	`taller_id` integer,
	`fecha_inscripcion` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`taller_id`) REFERENCES `talleres`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `mensajes_contacto` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`email` text NOT NULL,
	`telefono` text,
	`mensaje` text NOT NULL,
	`fecha_creacion` text DEFAULT 'CURRENT_TIMESTAMP',
	`leido` integer DEFAULT 0
);
--> statement-breakpoint
CREATE TABLE `notas_fidelizacion` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cliente_id` integer,
	`nota` text NOT NULL,
	`fecha` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pedido_items` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`pedido_id` integer,
	`producto_id` integer,
	`cantidad` integer NOT NULL,
	`precio_unitario` integer NOT NULL,
	FOREIGN KEY (`pedido_id`) REFERENCES `pedidos`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`producto_id`) REFERENCES `productos`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `pedidos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`cliente_id` integer,
	`total` integer NOT NULL,
	`estado` text DEFAULT 'pendiente',
	`fecha_pedido` text DEFAULT 'CURRENT_TIMESTAMP',
	FOREIGN KEY (`cliente_id`) REFERENCES `clientes`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `productos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`descripcion` text,
	`precio` integer,
	`stock` integer DEFAULT 0,
	`activo` integer DEFAULT 1,
	`imageurl` text
);
--> statement-breakpoint
CREATE TABLE `talleres` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nombre` text NOT NULL,
	`descripcion` text,
	`fecha` text,
	`tipo` text,
	`precio` integer,
	`activo` integer DEFAULT 1,
	`imageurl` text,
	`lugar` text,
	`cupos_totales` integer DEFAULT 10,
	`cupos_inscritos` integer DEFAULT 0
);
