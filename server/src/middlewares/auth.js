import jwt from 'jsonwebtoken';

export const protegerRutas = (req, res, next) => {
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

export const esAdmin = (req, res, next) => {
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado, se requiere rol de administrador' });
  }
  next();
};

export const esCliente = (req, res, next) => {
  if (req.user.rol !== 'cliente') {
    return res.status(403).json({ message: 'Acceso denegado, se requiere rol de cliente' });
  }
  next();
};

// Middleware de auth "opcional": si viene un JWT válido, adjunta req.user
// (igual que protegerRutas); si no viene Authorization, o el token es
// inválido/expirado, sigue sin bloquear la petición y sin req.user. Pensado
// para rutas públicas que además quieren enriquecer la respuesta cuando
// quien pide está logueado (ej. inscripción a taller), sin romper el flujo
// anónimo que ya existe hoy.
export const usuarioOpcional = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return next();

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (!err) req.user = user;
    next();
  });
};
