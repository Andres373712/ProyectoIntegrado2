import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';

// Importar todas las páginas (AHORA DESDE ./pages/)
import Homepage from './pages/Homepage.jsx';
import Catalogo from './pages/Catalogo.jsx';
import Inscripcion from './pages/Inscripcion.jsx';
import Login from './pages/Login.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import Admin from './pages/Admin.jsx';
import EditarTaller from './pages/EditarTaller.jsx';
import AdminClientes from './pages/AdminClientes.jsx';
import ClienteDetalle from './pages/ClienteDetalle.jsx';

// Este se queda en src/ porque no es una página
import ProtectedRoute from './ProtectedRoute.jsx';
// Componente de Navegación (Actualizado)
function Navegacion() {
    const navigate = useNavigate();
    const location = useLocation();
    const token = localStorage.getItem('tmm_token');

    const handleLogout = () => {
        localStorage.removeItem('tmm_token');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    return (
        <nav className="bg-background shadow-md p-4 flex flex-wrap justify-center items-center gap-4 md:gap-8 text-center sticky top-0 z-50">
            <Link to="/" className={`text-tmm-dark font-bold hover:text-primary ${isActive('/') ? 'text-primary underline' : ''}`}>
                Inicio
            </Link>
            {/* 2. ENLACE A CATÁLOGO COMPLETO */}
            <Link to="/catalogo" className={`text-tmm-dark font-bold hover:text-primary ${isActive('/catalogo') ? 'text-primary underline' : ''}`}>
                Talleres
            </Link>

            {/* (Aquí podríamos añadir "Quienes Somos" y "Contacto" en el futuro) */}

            {token && (
                <>
                    <Link to="/admin" className={`text-tmm-dark font-bold hover:text-primary ${isActive('/admin') ? 'text-primary underline' : ''}`}>Dashboard</Link>
                    <Link to="/admin/talleres" className={`text-tmm-dark font-bold hover:text-primary ${isActive('/admin/talleres') ? 'text-primary underline' : ''}`}>Gestionar Talleres</Link>
                    <Link to="/admin/clientes" className={`text-tmm-dark font-bold hover:text-primary ${isActive('/admin/clientes') ? 'text-primary underline' : ''}`}>Gestionar Clientas</Link>
                    <button onClick={handleLogout} className="text-sm text-red-500 hover:underline ml-auto">
                        Cerrar Sesión
                    </button>
                </>
            )}
            {!token && location.pathname !== '/login' && (
                 <Link to="/login" className="text-tmm-dark font-bold hover:text-primary ml-auto">
                    Acceso Admin
                </Link>
            )}
        </nav>
    );
}

function App() {
  return (
    <Router>
      <Navegacion />
      <Routes>
        {/* --- 3. RUTAS PÚBLICAS ACTUALIZADAS --- */}
        <Route path="/" element={<Homepage />} /> {/* <-- / AHORA ES LA HOMEPAGE */}
        <Route path="/catalogo" element={<Catalogo />} /> {/* <-- /catalogo ES LA LISTA COMPLETA */}
        <Route path="/inscribir/:id" element={<Inscripcion />} />
        <Route path="/login" element={<Login />} />

        {/* --- RUTAS PROTEGIDAS (Sin cambios) --- */}
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/talleres" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        <Route path="/admin/editar/:id" element={<ProtectedRoute><EditarTaller /></ProtectedRoute>} />
        <Route path="/admin/clientes" element={<ProtectedRoute><AdminClientes /></ProtectedRoute>} />
        <Route path="/admin/cliente/:id" element={<ProtectedRoute><ClienteDetalle /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;