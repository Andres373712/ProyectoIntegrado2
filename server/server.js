import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { initDb, connectDb } from './db.js';
import { enviarEmailConfirmacion } from './emailService.js';
import { v4 as uuidv4 } from 'uuid';

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import 'dotenv/config'; // Para leer el archivo .env

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

// ... Configuración de Multer ...
const storage = multer.diskStorage({
    destination: function (req, file, cb) { cb(null, 'uploads/'); },
    filename: function (req, file, cb) { cb(null, Date.now() + '-' + file.originalname); }
});
const upload = multer({ storage: storage });

// ======================================================
// === API DE AUTENTICACIÓN (LOGIN) ===
// ======================================================

app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email y contraseña son requeridos.' });
    }
    
    try {
        const db = await connectDb();
        const admin = await db.get('SELECT * FROM admin WHERE email = ?', email);

        if (!admin) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const passValida = await bcrypt.compare(password, admin.password_hash);
        if (!passValida) {
            return res.status(401).json({ message: 'Credenciales inválidas.' });
        }

        const token = jwt.sign(
            { id: admin.id, email: admin.email },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );
        
        res.json({ message: 'Login exitoso', token: token });

    } catch (error) {
        res.status(500).json({ message: 'Error en el servidor al intentar iniciar sesión.' });
    }
});

// ======================================================
// === MIDDLEWARE DE AUTENTICACIÓN (El "Guardia") ===
// ======================================================

const protegerRutas = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        return res.status(401).json({ message: 'Acceso denegado. Se requiere token.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Token inválido o expirado.' });
        }
        req.user = user;
        next();
    });
};

// ======================================================
// === API DE TALLERES (AHORA PROTEGIDA) ===
// ======================================================

// GET /api/talleres/activos (PÚBLICA)
app.get('/api/talleres/activos', async (req, res) => {
  try {
    const db = await connectDb();
    const talleres = await db.all('SELECT * FROM talleres WHERE activo = true');
    res.json(talleres);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener talleres.' });
  }
});

// GET /api/taller/:id (PÚBLICA)
app.get('/api/taller/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const db = await connectDb();
        const taller = await db.get('SELECT * FROM talleres WHERE id = ?', id);
        if (taller) { res.json(taller); } else { res.status(404).json({ message: 'Taller no encontrado.' }); }
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener el taller.' });
    }
});

// --- RUTAS PROTEGIDAS ---
app.get('/api/talleres/todos', protegerRutas, async (req, res) => {
  try {
    const db = await connectDb();
    const talleres = await db.all('SELECT * FROM talleres ORDER BY fecha DESC');
    res.json(talleres);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener talleres.' });
  }
});

app.post('/api/talleres', protegerRutas, upload.single('imagen'), async (req, res) => {
    const { nombre, descripcion, fecha, tipo, precio } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null; 
    if (!nombre || precio === undefined) { return res.status(400).json({ message: 'Nombre y precio son obligatorios.' }); }
    try {
        const db = await connectDb();
        const result = await db.run('INSERT INTO talleres (nombre, descripcion, fecha, tipo, precio, activo, imageUrl) VALUES (?, ?, ?, ?, ?, true, ?)', nombre, descripcion, fecha, tipo, precio, imageUrl);
        res.status(201).json({ id: result.lastID, message: 'Taller creado con éxito' });
    } catch (error) {
        res.status(500).json({ message: 'Error al crear el taller.' });
    }
});

app.put('/api/talleres/:id', protegerRutas, upload.single('imagen'), async (req, res) => {
    const { id } = req.params;
    const { nombre, descripcion, fecha, tipo, precio, activo } = req.body;
    let imageUrl = req.body.imageUrlActual; 
    if (req.file) { imageUrl = `/uploads/${req.file.filename}`; }
    try {
        const db = await connectDb();
        await db.run('UPDATE talleres SET nombre = ?, descripcion = ?, fecha = ?, tipo = ?, precio = ?, activo = ?, imageUrl = ? WHERE id = ?', nombre, descripcion, fecha, tipo, precio, activo, imageUrl, id);
        res.json({ message: 'Taller actualizado con éxito.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al actualizar el taller.' });
    }
});

app.delete('/api/talleres/:id', protegerRutas, async (req, res) => {
    const { id } = req.params;
    try {
        const db = await connectDb();
        await db.run('DELETE FROM talleres WHERE id = ?', id);
        res.json({ message: 'Taller eliminado con éxito.' });
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') { return res.status(400).json({ message: 'Error: No se puede eliminar el taller porque tiene clientes inscritos.' }); }
        res.status(500).json({ message: 'Error al eliminar el taller.' });
    }
});
    

// ========================================================
// === API DE CLIENTES (AHORA PROTEGIDA) ===
// ========================================================

// POST /api/inscripcion (PÚBLICA)
app.post('/api/inscripcion', async (req, res) => {
    const { tallerId, nombre, email, telefono, intereses } = req.body;
    if (!tallerId || !nombre || !email) { return res.status(400).json({ message: 'Faltan datos para la inscripción.' }); }

    try {
        const db = await connectDb();

        const datosTaller = await db.get('SELECT nombre, fecha, precio FROM talleres WHERE id = ?', tallerId);
        if (!datosTaller) {
            return res.status(404).json({ message: 'El taller no fue encontrado.' });
        }

        let clienta = await db.get('SELECT id FROM clientes WHERE email = ?', email);
        if (!clienta) {
            const result = await db.run('INSERT INTO clientes (nombre, email, telefono, intereses) VALUES (?, ?, ?, ?)', nombre, email, telefono, intereses);
            clienta = { id: result.lastID };
        }

        const tokenCancelacion = uuidv4();
        await db.run(
        'INSERT INTO inscripciones (cliente_id, taller_id, token_cancelacion) VALUES (?, ?, ?)', clienta.id, tallerId, tokenCancelacion
        );

        console.log('💾 Inscripción guardada con token:', tokenCancelacion);

        const datosClienta = { nombre, email };
        enviarEmailConfirmacion(datosClienta, datosTaller,tokenCancelacion)
            .catch(err => console.error('Fallo en el envío de email en segundo plano:', err)); 

        res.status(201).json({ message: `¡Gracias ${nombre}! Tu inscripción fue exitosa.` });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Hubo un error al procesar tu inscripción.' });
    }
});

// GET: Cancelar inscripción por token
app.get('/api/cancelar-inscripcion/:token', async (req, res) => {
    try {
        const { token } = req.params;
        console.log('🔍 Buscando token:', token); // LOG 1
        
        const db = await connectDb();
        
        // Buscar la inscripción
        const inscripcion = await db.get(
            'SELECT i.*, c.nombre, c.email, t.nombre as taller_nombre FROM inscripciones i JOIN clientes c ON i.cliente_id = c.id JOIN talleres t ON i.taller_id = t.id WHERE i.token_cancelacion = ?',
            token
        );
        
        console.log('📊 Resultado de búsqueda:', inscripcion); // LOG 2
        
        if (!inscripcion) {
            console.log('❌ No se encontró inscripción'); // LOG 3
            return res.status(404).json({ message: 'Inscripción no encontrada o ya fue cancelada.' });
        }
        
        // Eliminar la inscripción
        await db.run('DELETE FROM inscripciones WHERE token_cancelacion = ?', token);
        console.log('✅ Inscripción eliminada exitosamente'); // LOG 4
        
        res.json({ 
            message: 'Inscripción cancelada exitosamente.',
            taller: inscripcion.taller_nombre,
            nombre: inscripcion.nombre
        });
        
    } catch (error) {
        console.error('💥 Error al cancelar inscripción:', error);
        res.status(500).json({ message: 'Error al procesar la cancelación.' });
    }
});

// GET: /api/clientes (CORREGIDO)
app.get('/api/clientes', protegerRutas, async (req, res) => {
    try {
        const db = await connectDb();
        const { buscar, fechaInicio, fechaFin, tallerId } = req.query; 

        // Cambiamos COUNT(DISTINCT i.id) por COUNT(i.id) o COUNT(i.taller_id)
        let query = `
            SELECT c.*, COUNT(i.id) as total_inscripciones 
            FROM clientes c
            LEFT JOIN inscripciones i ON c.id = i.cliente_id 
        `; 

        const params = [];
        const conditions = [];

        if (tallerId) {
            conditions.push(`i.taller_id = ?`);
            params.push(tallerId);
        }
        if (buscar) {
            conditions.push(`(c.nombre LIKE ? OR c.email LIKE ?)`);
            params.push(`%${buscar}%`);
            params.push(`%${buscar}%`);
        }
        if (fechaInicio) {
            conditions.push(`c.fecha_registro >= ?`);
            params.push(`${fechaInicio}T00:00:00`); 
        }
        if (fechaFin) {
            conditions.push(`c.fecha_registro <= ?`);
            params.push(`${fechaFin}T23:59:59`);
        }

        if (conditions.length > 0) {
            query += ` WHERE ${conditions.join(' AND ')}`;
        }

        query += `
            GROUP BY c.id
            ORDER BY c.fecha_registro DESC
        `;

        const clientes = await db.all(query, params);
        res.json(clientes);
    } catch (error) {
        console.error("Error al obtener clientas:", error);
        res.status(500).json({ message: 'Error al obtener las clientas.' });
    }
});

app.get('/api/cliente/:id', protegerRutas, async (req, res) => {
    try {
        const { id } = req.params;
        const db = await connectDb();
        const clienta = await db.get('SELECT * FROM clientes WHERE id = ?', id);
        if (clienta) { res.json(clienta); } else { res.status(404).json({ message: 'Clienta no encontrada.' }); }
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener datos de la clienta.' });
    }
});

// GET: /api/cliente/:id/historial (CORREGIDO)
app.get('/api/cliente/:id/historial', protegerRutas, async (req, res) => {
    try {
        const { id } = req.params;
        const db = await connectDb();
        // Aseguramos seleccionar t.nombre y t.fecha explícitamente
        const historial = await db.all(`
            SELECT 
                t.nombre, 
                t.fecha, 
                i.fecha_inscripcion
            FROM inscripciones i
            JOIN talleres t ON i.taller_id = t.id
            WHERE i.cliente_id = ?
            ORDER BY t.fecha DESC 
        `, id); // Ordenar por t.fecha sí es correcto
        res.json(historial);
    } catch (error) {
         console.error("Error al obtener historial:", error); // Añadimos log de error
        res.status(500).json({ message: 'Error al obtener historial.' });
    }
});

app.get('/api/cliente/:id/notas', protegerRutas, async (req, res) => {
    try {
        const { id } = req.params;
        const db = await connectDb();
        const notas = await db.all('SELECT * FROM notas_fidelizacion WHERE cliente_id = ? ORDER BY fecha DESC', id);
        res.json(notas);
    } catch (error) {
        res.status(500).json({ message: 'Error al obtener notas.' });
    }
});

app.post('/api/cliente/:id/notas', protegerRutas, async (req, res) => {
    try {
        const { id } = req.params;
        const { nota } = req.body;
        if (!nota) { return res.status(400).json({ message: 'El contenido de la nota no puede estar vacío.' }); }
        const db = await connectDb();
        await db.run('INSERT INTO notas_fidelizacion (cliente_id, nota) VALUES (?, ?)', id, nota);
        res.status(201).json({ message: 'Nota añadida con éxito.' });
    } catch (error) {
        res.status(500).json({ message: 'Error al guardar la nota.' });
    }
});
// PUT: /api/cliente/:id (PROTEGIDA - Actualizar datos de una clienta)
app.put('/api/cliente/:id', protegerRutas, async (req, res) => {
    const { id } = req.params;
    const { nombre, email, telefono, intereses } = req.body; // Recibimos los datos actualizados

    // Validación básica
    if (!nombre || !email) {
        return res.status(400).json({ message: 'El nombre y el email son obligatorios.' });
    }

    try {
        const db = await connectDb();

        // Verificar si el nuevo email ya está en uso por OTRA clienta
        const emailExistente = await db.get('SELECT id FROM clientes WHERE email = ? AND id != ?', email, id);
        if (emailExistente) {
            return res.status(409).json({ message: 'El nuevo email ya está registrado por otra clienta.' }); // 409 Conflict
        }

        // Actualizar los datos en la base de datos
        await db.run(
            'UPDATE clientes SET nombre = ?, email = ?, telefono = ?, intereses = ? WHERE id = ?',
            nombre, email, telefono, intereses, id
        );

        res.json({ message: 'Datos de la clienta actualizados con éxito.' });

    } catch (error) {
        console.error("Error al actualizar clienta:", error);
        res.status(500).json({ message: 'Error al actualizar los datos de la clienta.' });
    }
});

// ======================================================
// === API PARA EL DASHBOARD ===
// ======================================================
// ... (El resto del código sigue igual) ...
// ======================================================
// === API PARA EL DASHBOARD ===
// ======================================================

// GET: /api/dashboard-data (PROTEGIDA)
app.get('/api/dashboard-data', protegerRutas, async (req, res) => {
    try {
        const db = await connectDb();
        
        const talleresEventos = await db.all('SELECT nombre as title, fecha as date FROM talleres WHERE activo = true AND fecha IS NOT NULL');
        const totalClientasRes = await db.get('SELECT COUNT(id) as total FROM clientes');
        const totalTalleresRes = await db.get('SELECT COUNT(id) as total FROM talleres WHERE activo = true');

        res.json({
            eventosCalendario: talleresEventos,
            totalClientas: totalClientasRes.total || 0,
            totalTalleresActivos: totalTalleresRes.total || 0
        });

    } catch (error) {
        console.error("Error al obtener datos del dashboard:", error);
        res.status(500).json({ message: 'Error al cargar datos del dashboard.' });
    }
});

// --- ELIMINAMOS LA LLAMADA DUPLICADA ---
// // Iniciar el servidor y la base de datos
// app.listen(PORT, async () => {
//   // ... (el resto del código sigue igual) ...
// });

// Iniciar el servidor (ESTA ES LA ÚNICA LLAMADA QUE DEBE QUEDAR)
app.listen(PORT, async () => {
  await initDb();
  console.log(`✅ Servidor (backend) funcionando en http://localhost:${PORT}`);
});