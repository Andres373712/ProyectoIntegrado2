import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import rateLimit from 'express-rate-limit';
import { initDb, db } from './db.js';
import {
  enviarEmailConfirmacion,
  enviarEmailVerificacion,
  enviarEmailRecuperacion,
  enviarEmailPedido,
  enviarEmailContacto
} from './emailService.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import validator from 'validator';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Demasiados intentos. Intenta de nuevo en unos minutos.' }
});

const EXTENSIONES_PERMITIDAS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif'
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, 'uploads')),
  filename: (req, file, cb) => {
    const ext = EXTENSIONES_PERMITIDAS[file.mimetype] || '';
    cb(null, `${Date.now()}-${uuidv4()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (EXTENSIONES_PERMITIDAS[file.mimetype]) return cb(null, true);
    cb(new Error('Tipo de archivo no permitido. Solo se aceptan imágenes JPG, PNG, WEBP o GIF.'));
  }
});

const protegerRutas = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Acceso denegado' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error('JWT Verification Error:', err);
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
};

const esAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado, se requiere rol de administrador' });
  }
  next();
};

// ===================== TALLERES =====================
app.get('/api/talleres/activos', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM talleres WHERE activo = true ORDER BY fecha ASC');
    const talleres = rows.map(t => ({
      ...t,
      imageUrl: t.imageurl,
      cupos_totales: t.cupos_totales || 10,
      cupos_inscritos: t.cupos_inscritos || 0
    }));
    res.json(talleres);
  } catch (error) {
    console.error('Error talleres activos:', error);
    res.status(500).json({ message: 'Error al cargar talleres' });
  }
});

app.get('/api/talleres/todos', protegerRutas, esAdmin, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM talleres ORDER BY fecha DESC');
    const talleres = rows.map(t => ({
      ...t,
      imageUrl: t.imageurl,
      cupos_totales: t.cupos_totales || 10,
      cupos_inscritos: t.cupos_inscritos || 0
    }));
    res.json(talleres);
  } catch (error) {
    console.error('Error talleres admin:', error);
    res.status(500).json({ message: 'Error' });
  }
});

app.get('/api/taller/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await db.query('SELECT * FROM talleres WHERE id = $1', [id]);
    const taller = rows[0];
    if (!taller) return res.status(404).json({ message: 'Taller no encontrado' });
    res.json({
      ...taller,
      imageUrl: taller.imageurl,
      cupos_totales: taller.cupos_totales || 10,
      cupos_inscritos: taller.cupos_inscritos || 0
    });
  } catch (error) {
    res.status(500).json({ message: 'Error' });
  }
});

app.post('/api/talleres', protegerRutas, esAdmin, upload.single('imagen'), async (req, res) => {
  const { nombre, descripcion, fecha, tipo, precio, lugar, cupos_totales } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!nombre || !precio) return res.status(400).json({ message: 'Faltan datos' });

  const precioNum = parseFloat(precio);
  const cupos = cupos_totales === undefined ? 10 : parseInt(cupos_totales);
  if (Number.isNaN(precioNum) || Number.isNaN(cupos)) {
    return res.status(400).json({ message: 'Precio o cupos totales inválidos' });
  }

  try {
    await db.query(
      `INSERT INTO talleres
       (nombre, descripcion, fecha, tipo, precio, activo, imageurl, lugar, cupos_totales, cupos_inscritos)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [nombre, descripcion || '', fecha, tipo, precioNum, true, imageUrl, lugar || '', cupos, 0]
    );
    res.status(201).json({ message: 'Taller creado con éxito' });
  } catch (error) {
    console.error('Error creando taller:', error);
    res.status(500).json({ message: 'Error al crear taller' });
  }
});

app.put('/api/talleres/:id', protegerRutas, esAdmin, upload.single('imagen'), async (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, fecha, tipo, precio, activo, lugar, cupos_totales } = req.body;
  let imageUrl = req.body.imageUrlActual || null;
  if (req.file) imageUrl = `/uploads/${req.file.filename}`;

  const precioNum = parseFloat(precio);
  const cuposNum = parseInt(cupos_totales);
  if (Number.isNaN(precioNum) || Number.isNaN(cuposNum)) {
    return res.status(400).json({ message: 'Precio o cupos totales inválidos' });
  }

  try {
    await db.query(
      `UPDATE talleres SET
       nombre=$1, descripcion=$2, fecha=$3, tipo=$4, precio=$5, activo=$6, imageurl=$7, lugar=$8, cupos_totales=$9
       WHERE id=$10`,
      [nombre, descripcion, fecha, tipo, precioNum, activo, imageUrl, lugar, cuposNum, id]
    );
    res.json({ message: 'Taller actualizado' });
  } catch (error) {
    console.error('Error actualizando taller:', error);
    res.status(500).json({ message: 'Error' });
  }
});

app.delete('/api/talleres/:id', protegerRutas, esAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM talleres WHERE id = $1', [id]);
    res.json({ message: 'Taller eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'No se puede eliminar (tiene inscripciones)' });
  }
});

// ===================== PRODUCTOS =====================
app.get('/api/productos/activos', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM productos WHERE activo = true ORDER BY id DESC');
    const productos = rows.map(p => ({ ...p, imageUrl: p.imageurl }));
    res.json(productos);
  } catch (error) {
    res.status(500).json({ message: 'Error productos públicos' });
  }
});

app.get('/api/productos/todos', protegerRutas, esAdmin, async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM productos ORDER BY id DESC');
    const productos = rows.map(p => ({ ...p, imageUrl: p.imageurl }));
    res.json(productos);
  } catch (error) {
    console.error('Error productos admin:', error);
    res.status(500).json({ message: 'Error' });
  }
});

app.post('/api/productos', protegerRutas, esAdmin, upload.single('imagen'), async (req, res) => {
  const { nombre, descripcion, precio, stock } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

  if (!nombre || !precio) return res.status(400).json({ message: 'Faltan datos' });

  const precioNum = parseFloat(precio);
  const stockNum = stock === undefined ? 0 : parseInt(stock);
  if (Number.isNaN(precioNum) || Number.isNaN(stockNum)) {
    return res.status(400).json({ message: 'Precio o stock inválidos' });
  }

  try {
    await db.query(
      'INSERT INTO productos (nombre, descripcion, precio, stock, activo, imageurl) VALUES ($1, $2, $3, $4, $5, $6)',
      [nombre, descripcion || '', precioNum, stockNum, true, imageUrl]
    );
    res.status(201).json({ message: 'Producto creado' });
  } catch (error) {
    console.error('Error creando producto:', error);
    res.status(500).json({ message: 'Error' });
  }
});

app.delete('/api/productos/:id', protegerRutas, esAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await db.query('DELETE FROM productos WHERE id = $1', [id]);
    res.json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ message: 'Error eliminando producto' });
  }
});

// ===================== CONTACTO =====================
app.post('/api/contacto', async (req, res) => {
  const { nombre, email, telefono, mensaje } = req.body;
  if (!nombre || !email || !mensaje) return res.status(400).json({ message: 'Faltan campos' });
  if (!validator.isEmail(email)) return res.status(400).json({ message: 'Email inválido' });

  try {
    await db.query('INSERT INTO mensajes_contacto (nombre, email, telefono, mensaje) VALUES ($1, $2, $3, $4)', [nombre, email, telefono || null, mensaje]);
    await enviarEmailContacto({ nombre, email, telefono, mensaje }).catch(console.error);
    res.json({ message: 'Mensaje enviado correctamente' });
  } catch (error) {
    console.error('Error contacto:', error);
    res.status(500).json({ message: 'Error enviando mensaje' });
  }
});

app.get('/api/mensajes-contacto', protegerRutas, esAdmin, async (req, res) => {
  if (req.user.rol !== 'admin') return res.status(403).json({ message: 'Acceso denegado' });

  try {
    const { rows } = await db.query('SELECT * FROM mensajes_contacto ORDER BY fecha_creacion DESC');
    res.json(rows);
  } catch (error) {
    console.error('Error cargando mensajes:', error);
    res.status(500).json({ message: 'Error al cargar mensajes' });
  }
});

// ===================== DASHBOARD DATA =====================
app.get('/api/dashboard-data', protegerRutas, esAdmin, async (req, res) => {
  try {
    const eventosResult = await db.query('SELECT nombre as title, fecha as date FROM talleres WHERE activo = true');
    const clientesResult = await db.query('SELECT COUNT(id) as total FROM clientes');
    const talleresResult = await db.query('SELECT COUNT(id) as total FROM talleres WHERE activo = true');

    const eventos = eventosResult.rows;
    const totalClientas = clientesResult.rows[0].total;
    const totalTalleresActivos = talleresResult.rows[0].total;

    res.json({
      eventosCalendario: eventos,
      totalClientas,
      totalTalleresActivos
    });
  } catch (error) {
    console.error('Error cargando dashboard:', error);
    res.status(500).json({ message: 'Error al cargar datos del dashboard' });
  }
});

// ===================== INSCRIPCIÓN =====================
app.post('/api/inscripcion', async (req, res) => {
  const { tallerId, nombre, email, telefono, intereses } = req.body;
  if (!tallerId || !nombre || !email) return res.status(400).json({ message: 'Faltan datos' });

  try {
    const { rows: tallerRows } = await db.query('SELECT * FROM talleres WHERE id = $1', [tallerId]);
    const taller = tallerRows[0];
    if (!taller) return res.status(404).json({ message: 'Taller no encontrado' });
    if (taller.cupos_inscritos >= taller.cupos_totales) return res.status(409).json({ message: 'Sin cupos' });

    let { rows: clienteRows } = await db.query('SELECT id FROM clientes WHERE email = $1', [email]);
    let cliente = clienteRows[0];

    if (!cliente) {
      const { rows } = await db.query(
        'INSERT INTO clientes (nombre, email, telefono, intereses) VALUES ($1, $2, $3, $4) RETURNING id',
        [nombre, email, telefono, intereses]
      );
      cliente = rows[0];
    }

    await db.query('INSERT INTO inscripciones (cliente_id, taller_id) VALUES ($1, $2)', [cliente.id, tallerId]);
    await db.query('UPDATE talleres SET cupos_inscritos = cupos_inscritos + 1 WHERE id = $1', [tallerId]);

    enviarEmailConfirmacion({ nombre, email }, taller).catch(console.error);
    res.status(201).json({ message: 'Inscripción exitosa' });
  } catch (error) {
    console.error('Error inscripción:', error);
    res.status(500).json({ message: 'Error al inscribir' });
  }
});

// ===================== LOGIN ADMIN =====================
app.post('/api/login', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await db.query('SELECT * FROM admin WHERE email = $1', [email]);
    const admin = rows[0];
    if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }
    const token = jwt.sign({ id: admin.id, email: admin.email, rol: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
    res.json({ message: 'Login exitoso', token });
  } catch (error) {
    res.status(500).json({ message: 'Error servidor' });
  }
});

// ===================== REGISTRO Y LOGIN CLIENTAS =====================
app.post('/api/auth/register-cliente', async (req, res) => {
  const { nombre, email, telefono, password, aceptaTerminos } = req.body;

  if (!nombre || !email || !telefono || !password) {
    return res.status(400).json({ message: 'Faltan campos obligatorios.' });
  }
  if (aceptaTerminos !== true) {
    return res.status(400).json({ message: 'Debes aceptar los términos y condiciones.' });
  }
  if (!validator.isEmail(email)) {
    return res.status(400).json({ message: 'Email inválido.' });
  }

  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,])[A-Za-z\d@$!%*?&.,]{8,}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({ 
      message: 'La contraseña debe tener mínimo 8 caracteres, mayúscula, número y símbolo.' 
    });
  }

  try {
    const { rows } = await db.query('SELECT id, password_hash FROM clientes WHERE email = $1', [email]);
    const clienteExistente = rows[0];

    const verificationToken = uuidv4();
    const passwordHash = await bcrypt.hash(password, 10);

    if (clienteExistente && !clienteExistente.password_hash) {
      await db.query(
        `UPDATE clientes 
         SET nombre = $1, telefono = $2, password_hash = $3, 
             token_verificacion = $4, verificado = false, acepta_terminos = true
         WHERE id = $5`,
        [nombre.trim(), telefono, passwordHash, verificationToken, clienteExistente.id]
      );
      await enviarEmailVerificacion({ nombre: nombre.trim(), email }, verificationToken);
      return res.status(201).json({ message: 'Cuenta actualizada. Revisa tu correo.' });
    }

    if (clienteExistente && clienteExistente.password_hash) {
      return res.status(409).json({ message: 'Ya existe una cuenta con este email.' });
    }

    await db.query(
      `INSERT INTO clientes 
       (nombre, email, telefono, password_hash, token_verificacion, verificado, acepta_terminos, rol) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        nombre.trim(),
        email.toLowerCase().trim(),
        telefono,
        passwordHash,
        verificationToken,
        false,
        true,
        'cliente'
      ]
    );

    await enviarEmailVerificacion({ nombre: nombre.trim(), email }, verificationToken);

    res.status(201).json({ 
      message: 'Registro exitoso. Revisa tu correo para activar tu cuenta.' 
    });

  } catch (error) {
    console.error('Error en registro cliente:', error);
    
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Este email ya está registrado.' });
    }
    
    res.status(500).json({ message: 'Error interno del servidor.' });
  }
});

app.post('/api/auth/login-cliente', loginLimiter, async (req, res) => {
  const { email, password } = req.body;
  try {
    const { rows } = await db.query('SELECT * FROM clientes WHERE email = $1', [email]);
    const cliente = rows[0];

    if (!cliente) return res.status(404).json({ message: 'Correo no registrado.' });
    if (!cliente.password_hash) return res.status(403).json({ message: 'Debes registrarte primero.' });
    if (!cliente.verificado) return res.status(403).json({ message: 'Verifica tu correo primero.' });

    const valido = await bcrypt.compare(password, cliente.password_hash);
    if (!valido) return res.status(401).json({ message: 'Contraseña incorrecta.' });

    const token = jwt.sign(
      { id: cliente.id, email: cliente.email, rol: 'cliente' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ message: 'Login exitoso', token });
  } catch (error) {
    console.error('Error login cliente:', error);
    res.status(500).json({ message: 'Error servidor' });
  }
});

app.get('/api/auth/verificar/:token', async (req, res) => {
  const { token } = req.params;
  try {
    const { rows } = await db.query('SELECT id FROM clientes WHERE token_verificacion = $1', [token]);
    if (rows.length === 0) {
      return res.redirect(`${FRONTEND_URL}/?error=invalid`);
    }
    await db.query('UPDATE clientes SET verificado = true, token_verificacion = NULL WHERE id = $1', [rows[0].id]);
    res.redirect(`${FRONTEND_URL}/?verified=true`);
  } catch (error) {
    res.status(500).send('Error');
  }
});

// ===================== MANEJO DE ERRORES DE SUBIDA =====================
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err.message?.includes('Tipo de archivo no permitido')) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

// ===================== INICIAR SERVIDOR =====================
app.listen(PORT, async () => {
  await initDb();
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Imágenes: http://localhost:${PORT}/uploads`);
});