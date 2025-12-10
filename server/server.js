import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { initDb, db } from './db.js';
import { enviarEmailConfirmacion, enviarEmailVerificacion, enviarEmailRecuperacion, enviarEmailPedido } from './emailService.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import 'dotenv/config';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import validator from 'validator';

// --- CONFIGURACIÓN DE RUTAS ABSOLUTAS ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Servir archivos estáticos (imágenes)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configuración de Multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, 'uploads'));
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + file.originalname);
    }
});
const upload = multer({ storage: storage });

// --- MIDDLEWARE DE AUTENTICACIÓN ---
const protegerRutas = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Acceso denegado' });
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Token inválido' });
        req.user = user;
        next();
    });
};

// ======================================================
// === API DE AUTENTICACIÓN (ADMIN Y CLIENTES) ===
// ======================================================

// REGEX DE CONTRASEÑA SEGURA (Permite . y ,)
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&.,])[A-Za-z\d@$!%*?&.,]{8,}$/;

// POST: Login de Admin
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Datos incompletos' });
    try {
        
        const result = await db.query('SELECT * FROM admin WHERE email = $1', [email]);
        const admin = result.rows[0];
        if (!admin || !(await bcrypt.compare(password, admin.password_hash))) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }
        const token = jwt.sign({ id: admin.id, email: admin.email, rol: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.json({ message: 'Login exitoso', token });
    } catch (error) { res.status(500).json({ message: 'Error servidor' }); }
});

// POST: Registrar Nuevo Cliente
app.post('/api/auth/register-cliente', async (req, res) => {
    const { nombre, email, telefono, password, aceptaTerminos } = req.body;
    
    if (!nombre || !email || !password || !telefono) return res.status(400).json({ message: 'Faltan campos obligatorios.' });
    if (aceptaTerminos !== true) return res.status(400).json({ message: 'Debes aceptar los términos y condiciones.' });
    if (!validator.isEmail(email)) return res.status(400).json({ message: 'Email inválido.' });
    //if (!telefono.match(/^9[0-9]{8}$/)) return res.status(400).json({ message: 'Teléfono inválido. Debe ser 9 dígitos comenzando con 9.' });
    
    if (!password.match(passwordRegex)) {
        return res.status(400).json({ message: 'Contraseña insegura: Mín 8 car., Mayús, minús, número y símbolo (@$!%*?&.,).' });
    }
    
    try {
        
        const result = await db.query('SELECT id, password_hash FROM clientes WHERE email = $1', [email]);
        const clienteExistente = result.rows[0];
        
        // CASO 1: Email ya registrado CON contraseña (usuario registrado)
        if (clienteExistente && clienteExistente.password_hash) {
            return res.status(409).json({ message: 'Ya existe una cuenta con este email. Inicia sesión.' });
        }
        
        const verificationToken = uuidv4();
        const passwordHash = await bcrypt.hash(password, 10);
        
        // CASO 2: Email existe pero SIN contraseña (visitante) → ACTUALIZAR
        if (clienteExistente && !clienteExistente.password_hash) {
            await db.query(
                'UPDATE clientes SET nombre = $1, telefono = $2, password_hash = $3, rol = $4, token_verificacion = $5, verificado = false, acepta_terminos = $6 WHERE id = $7',
                [nombre, telefono, passwordHash, 'cliente', verificationToken, aceptaTerminos, clienteExistente.id]
            );
            
            enviarEmailVerificacion({ nombre, email }, verificationToken).catch(console.error);
            return res.status(201).json({ message: 'Cuenta creada exitosamente. Revisa tu correo para activarla.' });
        }
        
        // CASO 3: Email NO existe → CREAR NUEVO
        await db.query(
            'INSERT INTO clientes (nombre, email, telefono, password_hash, rol, token_verificacion, verificado, acepta_terminos) VALUES ($1, $2, $3, $4, $5, $6, false, $7)',
            [nombre, email, telefono, passwordHash, 'cliente', verificationToken, aceptaTerminos]
        );

        enviarEmailVerificacion({ nombre, email }, verificationToken).catch(console.error);
        res.status(201).json({ message: 'Registro exitoso. Revisa tu correo para activar.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno.' });
    }
});

// POST: Login de Cliente
app.post('/api/auth/login-cliente', async (req, res) => {
    const { email, password } = req.body;
    try {
        
        const result = await db.query('SELECT * FROM clientes WHERE email = $1', [email]);
        const cliente = result.rows[0];
        
        // Verificar si el email existe
        if (!cliente) {
            return res.status(404).json({ message: 'Este correo no está registrado.' });
        }
        
        // Verificar si tiene contraseña (no es visitante)
        if (!cliente.password_hash) {
            return res.status(403).json({ message: 'Esta cuenta no tiene contraseña. Por favor regístrate.' });
        }
        
        // Verificar contraseña
        if (!(await bcrypt.compare(password, cliente.password_hash))) {
            return res.status(401).json({ message: 'El correo es válido pero la contraseña es incorrecta.' });
        }
        
        // Verificar si está verificado
        if (!cliente.verificado) {
            return res.status(403).json({ message: 'Cuenta no verificada. Revisa tu correo.' });
        }
        
        // Login exitoso
        const token = jwt.sign({ id: cliente.id, email: cliente.email, rol: 'cliente' }, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.json({ message: 'Login exitoso', token });
    } catch (error) { 
        console.error(error);
        res.status(500).json({ message: 'Error del servidor' }); 
    }
});

// GET: Verificar Email
app.get('/api/auth/verificar/:token', async (req, res) => {
    const { token } = req.params;
    try {
        
        const result = await db.query('SELECT id FROM clientes WHERE token_verificacion = $1', [token]);
        const clienta = result.rows[0];
        if (!clienta) return res.redirect('http://localhost:5173/login-cliente?error=token-invalido');
        await db.query('UPDATE clientes SET verificado = true, token_verificacion = NULL WHERE id = $1', [clienta.id]);
        res.redirect('http://localhost:5173/login-cliente?success=verificado');
    } catch (error) { res.status(500).send('Error interno.'); }
});

// --- RECUPERACIÓN DE CONTRASEÑA ---

// 1. Solicitar recuperación
app.post('/api/auth/forgot-password', async (req, res) => {
    const { email } = req.body;
    try {
        
        const result = await db.query('SELECT id FROM clientes WHERE email = $1', [email]);
        const cliente = result.rows[0];
        
        if (!cliente) {
            return res.json({ message: 'Si el correo existe, recibirás un un enlace de recuperación.' });
        }

        const token = uuidv4();
        const expiracion = new Date(Date.now() + 3600000); 

        await db.query('UPDATE clientes SET token_recuperacion = $1, expiracion_recuperacion = $2 WHERE id = $3', [token, expiracion, cliente.id]);
        
        enviarEmailRecuperacion(email, token).catch(console.error);
        res.json({ message: 'Si el correo existe, recibirás un enlace de recuperación.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno.' });
    }
});

// 2. Restablecer contraseña
app.post('/api/auth/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;
    
    if (!newPassword.match(passwordRegex)) {
        return res.status(400).json({ message: 'Contraseña insegura.' });
    }

    try {
        
        const result = await db.query('SELECT id FROM clientes WHERE token_recuperacion = $1 AND expiracion_recuperacion > NOW()', [token]);
        const cliente = result.rows[0];

        if (!cliente) {
            return res.status(400).json({ message: 'Enlace inválido o expirado.' });
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);
        
        await db.query('UPDATE clientes SET password_hash = $1, token_recuperacion = NULL, expiracion_recuperacion = NULL WHERE id = $2', [passwordHash, cliente.id]);
        
        res.json({ message: 'Contraseña restablecida con éxito.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno.' });
    }
});

// ======================================================
// === API DE PRODUCTOS (MARKETPLACE) ===
// ======================================================

app.get('/api/productos/activos', async (req, res) => {
    try {
        
        const result = await db.query('SELECT * FROM productos WHERE activo = true');
        const productos = result.rows;
        res.json(productos);
    } catch (error) { res.status(500).json({ message: 'Error al obtener productos.' }); }
});

app.get('/api/productos/todos', protegerRutas, async (req, res) => {
    try {
        
        const result = await db.query('SELECT * FROM productos ORDER BY id DESC');
        const productos = result.rows;
        res.json(productos);
    } catch (error) { res.status(500).json({ message: 'Error al obtener productos.' }); }
});

app.get('/api/producto/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await db.query('SELECT * FROM productos WHERE id = $1', [id]);
        const producto = result.rows[0];
        if (producto) res.json(producto); else res.status(404).json({ message: 'Producto no encontrado' });
    } catch (error) { res.status(500).json({ message: 'Error al obtener producto.' }); }
});

app.post('/api/productos', protegerRutas, upload.single('imagen'), async (req, res) => {
    const { nombre, descripcion, precio, stock } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    if (!nombre || precio === undefined) return res.status(400).json({ message: 'Datos incompletos' });
    try {
        
        const result = await db.query(
            'INSERT INTO productos (nombre, descripcion, precio, stock, activo, imageUrl) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [nombre, descripcion, precio, stock || 0, true, imageUrl]
        );
        res.status(201).json({ id: result.rows[0].id, message: 'Producto creado' });
    } catch (error) { res.status(500).json({ message: 'Error al crear' }); }
});

app.put('/api/productos/:id', protegerRutas, upload.single('imagen'), async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, precio, stock, activo } = req.body;
    let imageUrl = req.body.imageUrlActual;
    if (req.file) imageUrl = `/uploads/${req.file.filename}`;
    try {
        
        await db.query(
            'UPDATE productos SET nombre = $1, descripcion = $2, precio = $3, stock = $4, activo = $5, imageUrl = $6 WHERE id = $7',
            [nombre, descripcion, precio, stock, activo, imageUrl, id]
        );
        res.json({ message: 'Producto actualizado' });
    } catch (error) { res.status(500).json({ message: 'Error al actualizar' }); }
});

app.delete('/api/productos/:id', protegerRutas, async (req, res) => {
    const { id } = req.params;
    try {
        
        await db.query('DELETE FROM productos WHERE id = $1', [id]);
        res.json({ message: 'Producto eliminado' });
    } catch (error) { res.status(500).json({ message: 'Error al eliminar' }); }
});


// ======================================================
// === API DE TALLERES (CON CUPOS) ===
// ======================================================

app.get('/api/talleres/activos', async (req, res) => {
    
    const result = await db.query('SELECT * FROM talleres WHERE activo = true');
    const talleres = result.rows;
    res.json(talleres);
});

app.get('/api/talleres/todos', protegerRutas, async (req, res) => {
    
    const result = await db.query('SELECT * FROM talleres ORDER BY fecha DESC');
    const talleres = result.rows;
    res.json(talleres);
});

app.get('/api/taller/:id', async (req, res) => {
    const { id } = req.params;
    
    const result = await db.query('SELECT * FROM talleres WHERE id = $1', [id]);
    const taller = result.rows[0];
    if (taller) res.json(taller); else res.status(404).json({message:'No encontrado'});
});

app.post('/api/talleres', protegerRutas, upload.single('imagen'), async (req, res) => {
    const { nombre, descripcion, fecha, tipo, precio, lugar, cupos_totales } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; 
    
    // --- VALIDACIÓN MEJORADA ---
    if (!nombre || precio === undefined || precio === '' || isNaN(parseFloat(precio))) {
        return res.status(400).json({ message: 'Faltan datos o el precio no es un número válido.' });
    }

    try {
        
        const cupos = parseInt(cupos_totales) || 10; 
        const result = await db.query(
            'INSERT INTO talleres (nombre, descripcion, fecha, tipo, precio, activo, imageUrl, lugar, cupos_totales, cupos_inscritos) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING id',
            [nombre, descripcion, fecha, tipo, parseFloat(precio), true, imageUrl, lugar, cupos, 0]
        );
        res.status(201).json({ id: result.rows[0].id, message: 'Taller creado con éxito' });
    } catch (error) { console.error(error); res.status(500).json({ message: 'Error al crear taller' }); }
});

app.put('/api/talleres/:id', protegerRutas, upload.single('imagen'), async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, fecha, tipo, precio, activo, lugar, cupos_totales } = req.body;
    let imageUrl = req.body.imageUrlActual; 
    if (req.file) imageUrl = `/uploads/${req.file.filename}`;
    try {
        
        await db.query(
            'UPDATE talleres SET nombre = $1, descripcion = $2, fecha = $3, tipo = $4, precio = $5, activo = $6, imageUrl = $7, lugar = $8, cupos_totales = $9 WHERE id = $10',
            [nombre, descripcion, fecha, tipo, precio, activo, imageUrl, lugar, cupos_totales, id]
        );
        res.json({ message: 'Taller actualizado' });
    } catch (error) { res.status(500).json({ message: 'Error al actualizar' }); }
});

app.delete('/api/talleres/:id', protegerRutas, async (req, res) => {
    const { id } = req.params;
    
    try {
        await db.query('DELETE FROM talleres WHERE id = $1', [id]);
        res.json({message:'Eliminado'});
    } catch(e) { res.status(500).json({message:'No se puede eliminar si tiene inscritos'}); }
});

// --- INSCRIPCIÓN ---
app.post('/api/inscripcion', async (req, res) => {
    const { tallerId, nombre, email, telefono, intereses } = req.body;
    if (!tallerId || !nombre || !email) return res.status(400).json({ message: 'Datos incompletos' });
    try {
        
        const tallerResult = await db.query('SELECT * FROM talleres WHERE id = $1', [tallerId]);
        const taller = tallerResult.rows[0];
        if (!taller) return res.status(404).json({ message: 'Taller no encontrado' });
        if (taller.cupos_inscritos >= taller.cupos_totales) return res.status(409).json({ message: 'Cupos agotados.' });

        let clientaResult = await db.query('SELECT id FROM clientes WHERE email = $1', [email]);
        let clienta = clientaResult.rows[0];
        if (!clienta) {
            // Cliente invitado (sin password)
            const result = await db.query('INSERT INTO clientes (nombre, email, telefono, intereses) VALUES ($1, $2, $3, $4) RETURNING id', [nombre, email, telefono, intereses]);
            clienta = { id: result.rows[0].id };
        }
        await db.query('INSERT INTO inscripciones (cliente_id, taller_id) VALUES ($1, $2)', [clienta.id, tallerId]);
        await db.query('UPDATE talleres SET cupos_inscritos = cupos_inscritos + 1 WHERE id = $1', [tallerId]);
        
        enviarEmailConfirmacion({ nombre, email }, taller).catch(console.error); 
        res.status(201).json({ message: `¡Inscripción exitosa!` });
    } catch (error) { console.error(error); res.status(500).json({ message: 'Error interno' }); }
});

// --- ENDPOINT PARA PEDIDOS DEL CARRITO ---
app.post('/api/pedido', async (req, res) => {
    const { nombre, email, telefono, productos, total } = req.body;
    
    if (!nombre || !email || !productos || productos.length === 0) {
        return res.status(400).json({ message: 'Datos incompletos' });
    }

    try {
        
        
        // 1. Buscar o crear cliente
        let clienteResult = await db.query('SELECT id FROM clientes WHERE email = $1', [email]);
        let cliente = clienteResult.rows[0];
        if (!cliente) {
            const result = await db.query(
                'INSERT INTO clientes (nombre, email, telefono) VALUES ($1, $2, $3) RETURNING id',
                [nombre, email, telefono]
            );
            cliente = { id: result.rows[0].id };
        }

        // 2. Crear pedido
        const pedidoResult = await db.query(
            'INSERT INTO pedidos (cliente_id, total, estado) VALUES ($1, $2, $3) RETURNING id',
            [cliente.id, total, 'pendiente']
        );
        const pedidoId = pedidoResult.rows[0].id;

        // 3. Guardar items del pedido
        for (const item of productos) {
            await db.query(
                'INSERT INTO pedido_items (pedido_id, producto_id, cantidad, precio_unitario) VALUES ($1, $2, $3, $4)',
                [pedidoId, item.id, item.cantidad, item.precio]
            );
        }

        // 4. Enviar email de confirmación
        enviarEmailPedido({ nombre, email }, productos, total, pedidoId).catch(console.error);

        res.status(201).json({ 
            message: `Hemos recibido tu pedido. Te contactaremos pronto al ${telefono} para coordinar el pago y envío.` 
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al procesar el pedido.' });
    }
});

// ======================================================
// === API DE CLIENTES (CRM) ===
// ======================================================

app.get('/api/clientes', protegerRutas, async (req, res) => {
    try {
        
        const { buscar, fechaInicio, fechaFin, tallerId } = req.query; 
        let query = `SELECT c.*, COUNT(i.id) as total_inscripciones FROM clientes c LEFT JOIN inscripciones i ON c.id = i.cliente_id `; 
        const params = [];
        let paramIndex = 1;
        const conditions = [];
        if (tallerId) { conditions.push(`i.taller_id = $${paramIndex++}`); params.push(tallerId); }
        if (buscar) { conditions.push(`(c.nombre ILIKE $${paramIndex++} OR c.email ILIKE $${paramIndex++})`); params.push(`%${buscar}%`); params.push(`%${buscar}%`); }
        if (fechaInicio) { conditions.push(`c.fecha_registro >= $${paramIndex++}`); params.push(`${fechaInicio}T00:00:00`); }
        if (fechaFin) { conditions.push(`c.fecha_registro <= $${paramIndex++}`); params.push(`${fechaFin}T23:59:59`); }
        if (conditions.length > 0) query += ` WHERE ${conditions.join(' AND ')}`;
        query += ` GROUP BY c.id ORDER BY c.fecha_registro DESC`;
        const result = await db.query(query, params);
        const clientes = result.rows;
        res.json(clientes);
    } catch (error) { res.status(500).json({ message: 'Error al obtener clientes.' }); }
});

app.get('/api/cliente/:id', protegerRutas, async (req, res) => {
    const { id } = req.params; 
    const result = await db.query('SELECT * FROM clientes WHERE id=$1',[id]); 
    res.json(result.rows[0]);
});

app.put('/api/cliente/:id', protegerRutas, async (req, res) => {
    const { id } = req.params; const { nombre, email, telefono, intereses } = req.body;
    
    await db.query('UPDATE clientes SET nombre=$1, email=$2, telefono=$3, intereses=$4 WHERE id=$5', [nombre, email, telefono, intereses, id]);
    res.json({message:'Actualizado'});
});

app.get('/api/cliente/:id/historial', protegerRutas, async (req, res) => {
    const { id } = req.params; 
    const result = await db.query(`SELECT t.nombre, t.fecha, i.fecha_inscripcion FROM inscripciones i JOIN talleres t ON i.taller_id=t.id WHERE i.cliente_id=$1 ORDER BY t.fecha DESC`, [id]);
    const h = result.rows;
    res.json(h);
});

app.get('/api/cliente/:id/notas', protegerRutas, async (req, res) => {
    const { id } = req.params; 
    const result = await db.query('SELECT * FROM notas_fidelizacion WHERE cliente_id=$1 ORDER BY fecha DESC', [id]); 
    const n = result.rows;
    res.json(n);
});

app.post('/api/cliente/:id/notas', protegerRutas, async (req, res) => {
    const { id } = req.params; const { nota } = req.body; 
    await db.query('INSERT INTO notas_fidelizacion (cliente_id, nota) VALUES ($1, $2)', [id, nota]); res.json({message:'Nota guardada'});
});

// --- DASHBOARD ---
app.get('/api/dashboard-data', protegerRutas, async (req, res) => {
    
    const eventosResult = await db.query('SELECT nombre as title, fecha as date FROM talleres WHERE activo=true');
    const clientesResult = await db.query('SELECT COUNT(id) as total FROM clientes');
    const talleresResult = await db.query('SELECT COUNT(id) as total FROM talleres WHERE activo=true');
    
    const e = eventosResult.rows;
    const c = clientesResult.rows[0];
    const t = talleresResult.rows[0];

    res.json({eventosCalendario:e, totalClientas:c.total, totalTalleresActivos:t.total});
});

// ======================================================
// === API DE MENSAJES DE CONTACTO (NUEVO) ===
// ======================================================

// POST: Recibir un nuevo mensaje de contacto
app.post('/api/contacto', async (req, res) => {
    const { nombre, email, telefono, mensaje } = req.body;
    if (!nombre || !email || !mensaje) {
        return res.status(400).json({ message: 'Nombre, email y mensaje son obligatorios.' });
    }
    try {
        
        await db.query(
            'INSERT INTO mensajes_contacto (nombre, email, telefono, mensaje) VALUES ($1, $2, $3, $4)',
            [nombre, email, telefono, mensaje]
        );
        res.status(201).json({ message: 'Gracias por tu mensaje. Te contactaremos pronto.' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al guardar el mensaje.' });
    }
});

// GET: Obtener todos los mensajes de contacto (solo para admin)
app.get('/api/mensajes-contacto', protegerRutas, async (req, res) => {
    // Asegurarse de que el rol es admin
    if (req.user.rol !== 'admin') {
        return res.status(403).json({ message: 'Acceso no autorizado.' });
    }
    try {
        
        const result = await db.query('SELECT * FROM mensajes_contacto ORDER BY fecha_creacion DESC');
        const mensajes = result.rows;
        res.json(mensajes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los mensajes.' });
    }
});


// --- INICIAR SERVIDOR ---
app.listen(PORT, async () => {
  await initDb();
  console.log(`✅ Servidor (backend) funcionando en http://localhost:${PORT}`);
});