#!/usr/bin/env node
// Crea contenido de demostración (4 talleres + 4 kits de producto
// relacionados, cada uno con su propia imagen) llamando a la API real del
// backend — el mismo camino que usa el panel de admin (login + POST
// multipart) — para que el catálogo público se vea poblado en vez de vacío.
//
// Idempotente: antes de crear, lista los talleres/productos existentes y
// omite cualquiera cuyo nombre ya esté (se puede correr más de una vez sin
// duplicar contenido).
//
// Uso contra un backend local (server corriendo en localhost:5000):
//   SEED_ADMIN_PASSWORD=<contraseña de carolina@tmm.cl> node scripts/seedDemoContent.js
//
// Uso contra producción (Railway):
//   SEED_API_URL=https://<tu-servicio>.up.railway.app \
//   SEED_ADMIN_PASSWORD=<contraseña real> \
//   node scripts/seedDemoContent.js
//
// No requiere dependencias nuevas: usa fetch/FormData/Blob nativos de Node
// (18+). Las imágenes viven en scripts/seed-images/ junto a este archivo.

import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IMAGES_DIR = path.join(__dirname, 'seed-images');

const API_URL = (process.env.SEED_API_URL || 'http://localhost:5000').replace(/\/+$/, '');
const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL || 'carolina@tmm.cl';
const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD;

if (!ADMIN_PASSWORD) {
  console.error(
    [
      'Falta SEED_ADMIN_PASSWORD.',
      '',
      'Ejemplo (backend local):',
      '  SEED_ADMIN_PASSWORD=<contraseña de admin> node scripts/seedDemoContent.js',
      '',
      'Ejemplo (producción en Railway):',
      '  SEED_API_URL=https://<tu-servicio>.up.railway.app \\',
      '  SEED_ADMIN_PASSWORD=<contraseña real> \\',
      '  node scripts/seedDemoContent.js',
    ].join('\n'),
  );
  process.exit(1);
}

const TALLERES = [
  {
    nombre: 'Resina Artística: Joyas y Posavasos',
    descripcion:
      'Aprende las técnicas base del arte en resina epóxica creando tus propias joyas y posavasos únicos. Ideal para principiantes: te llevas a casa al menos 3 piezas terminadas y todo el conocimiento para seguir creando.',
    fecha: '2026-09-12T18:00:00',
    tipo: 'B2C',
    precio: 25000,
    lugar: 'Estudio TMM, Providencia, Santiago',
    cupos_totales: 12,
    imagen: 'resina_taller.jpg',
  },
  {
    nombre: 'Aromaterapia: Aceites Esenciales para el Bienestar',
    descripcion:
      'Un taller sensorial para conocer las propiedades de los aceites esenciales y aprender a crear tus propias mezclas para relajación, energía y equilibrio emocional. Te llevas tu propio frasco de aceite personalizado.',
    fecha: '2026-09-19T18:30:00',
    tipo: 'B2C',
    precio: 22000,
    lugar: 'Estudio TMM, Providencia, Santiago',
    cupos_totales: 15,
    imagen: 'aromaterapia_taller.jpg',
  },
  {
    nombre: 'Agendas y Cuadernos Artesanales',
    descripcion:
      'Diseña y encuaderna tu propia agenda o cuaderno desde cero: elige tapas, papeles y detalles decorativos para crear una pieza 100% tuya, perfecta para organizar tus proyectos o llevar un diario.',
    fecha: '2026-09-26T17:00:00',
    tipo: 'B2C',
    precio: 20000,
    lugar: 'Estudio TMM, Providencia, Santiago',
    cupos_totales: 10,
    imagen: 'agendas_taller.jpg',
  },
  {
    nombre: 'Macramé Decorativo: Tu Primer Tapiz',
    descripcion:
      'Descubre el arte del macramé creando tu propio tapiz decorativo para el hogar. Aprenderás los nudos base y te llevarás tu pieza terminada, lista para colgar.',
    fecha: '2026-10-03T18:00:00',
    tipo: 'B2C',
    precio: 23000,
    lugar: 'Estudio TMM, Providencia, Santiago',
    cupos_totales: 12,
    imagen: 'macrame_taller.jpg',
  },
];

const PRODUCTOS = [
  {
    nombre: 'Kit de Resina para Principiantes',
    descripcion:
      'Todo lo que necesitas para iniciarte en el arte de la resina epóxica: resina, moldes, pigmentos y guía paso a paso para crear tus primeras piezas en casa.',
    precio: 18000,
    stock: 20,
    imagen: 'resina_kit.jpg',
  },
  {
    nombre: 'Kit de Aromaterapia: Aceites y Difusor',
    descripcion:
      'Un set de aceites esenciales seleccionados junto a un difusor artesanal, para que sigas explorando la aromaterapia y llenes tu espacio de bienestar.',
    precio: 24000,
    stock: 15,
    imagen: 'aromaterapia_kit.jpg',
  },
  {
    nombre: 'Kit Agenda Artesanal para Armar',
    descripcion:
      'Todos los materiales para encuadernar tu propia agenda en casa: tapas, papeles, hilo y aguja, más una guía ilustrada para seguir el proceso a tu ritmo.',
    precio: 15000,
    stock: 18,
    imagen: 'agendas_kit.jpg',
  },
  {
    nombre: 'Kit de Macramé: Cuerdas y Anillo de Madera',
    descripcion:
      'Cuerdas de algodón, anillo de madera y guía de nudos básicos para crear tu propio colgante decorativo en casa, a tu propio ritmo.',
    precio: 16000,
    stock: 20,
    imagen: 'macrame_kit.jpg',
  },
];

async function login() {
  const res = await fetch(`${API_URL}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Login falló (${res.status}): ${data.message || res.statusText}`);
  }
  return data.token;
}

async function getNombresExistentes(token, recurso) {
  const res = await fetch(`${API_URL}/api/${recurso}/todos`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error(`No se pudo listar ${recurso} existentes (${res.status})`);
  }
  const data = await res.json();
  const lista = Array.isArray(data) ? data : [];
  return new Set(lista.map((item) => String(item.nombre).trim().toLowerCase()));
}

async function crearTaller(token, taller) {
  const buffer = await readFile(path.join(IMAGES_DIR, taller.imagen));
  const form = new FormData();
  form.append('nombre', taller.nombre);
  form.append('descripcion', taller.descripcion);
  form.append('fecha', new Date(taller.fecha).toISOString());
  form.append('tipo', taller.tipo);
  form.append('precio', String(taller.precio));
  form.append('lugar', taller.lugar);
  form.append('cupos_totales', String(taller.cupos_totales));
  form.append('imagen', new Blob([buffer], { type: 'image/jpeg' }), taller.imagen);

  const res = await fetch(`${API_URL}/api/talleres`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `Error creando taller "${taller.nombre}" (${res.status}): ${data.message || res.statusText}`,
    );
  }
}

async function crearProducto(token, producto) {
  const buffer = await readFile(path.join(IMAGES_DIR, producto.imagen));
  const form = new FormData();
  form.append('nombre', producto.nombre);
  form.append('descripcion', producto.descripcion);
  form.append('precio', String(producto.precio));
  form.append('stock', String(producto.stock));
  form.append('imagen', new Blob([buffer], { type: 'image/jpeg' }), producto.imagen);

  const res = await fetch(`${API_URL}/api/productos`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      `Error creando producto "${producto.nombre}" (${res.status}): ${data.message || res.statusText}`,
    );
  }
}

async function main() {
  console.log(`Conectando a ${API_URL} como ${ADMIN_EMAIL}...`);
  const token = await login();

  const talleresExistentes = await getNombresExistentes(token, 'talleres');
  const productosExistentes = await getNombresExistentes(token, 'productos');

  for (const taller of TALLERES) {
    if (talleresExistentes.has(taller.nombre.trim().toLowerCase())) {
      console.log(`- Taller "${taller.nombre}" ya existe, se omite.`);
      continue;
    }
    await crearTaller(token, taller);
    console.log(`✓ Taller creado: ${taller.nombre}`);
  }

  for (const producto of PRODUCTOS) {
    if (productosExistentes.has(producto.nombre.trim().toLowerCase())) {
      console.log(`- Producto "${producto.nombre}" ya existe, se omite.`);
      continue;
    }
    await crearProducto(token, producto);
    console.log(`✓ Producto creado: ${producto.nombre}`);
  }

  console.log('Listo.');
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
