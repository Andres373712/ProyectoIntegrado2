import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Catalogo() {
  const [talleres, setTalleres] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/api/talleres/activos')
      .then(response => setTalleres(response.data))
      .catch(error => console.error("Error al cargar talleres:", error));
  }, []);

  return (
    <div className="bg-tmm-blue min-h-screen p-4 sm:p-8 font-sans">
      <div className="text-center mb-8">
        <h1 className="text-4xl md:text-5xl font-bold text-tmm-dark">Talleres y Conexión</h1>
        <p className="text-lg text-tmm-dark/80 mt-2">Explora nuestras experiencias de bienestar artesanal</p>
      </div>
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {talleres.map(taller => (
          <div key={taller.id} className="bg-white rounded-xl shadow-lg p-6 flex flex-col justify-between transform hover:-translate-y-2 transition-transform duration-300">
            <div>
              <div className="h-40 w-full mb-4">
    {taller.imageUrl ? (
        <img 
            src={`http://localhost:5000${taller.imageUrl}`} 
            alt={taller.nombre} 
            className="w-full h-full object-cover rounded-md" 
        />
    ) : (
        <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
            <span className="text-gray-400 text-sm">Sin imagen</span>
        </div>
    )}
</div>
              <span className={`inline-block text-white text-xs px-2 py-1 rounded-full uppercase font-semibold tracking-wide ${taller.tipo === 'KIT' ? 'bg-green-400' : 'bg-tmm-mint/90'}`}>{taller.tipo}</span>
              <h2 className="text-2xl font-bold mt-2 text-tmm-dark">{taller.nombre}</h2>
              <p className="text-gray-600">Fecha: {new Date(taller.fecha).toLocaleDateString('es-CL')}</p>
              <p className="text-xl font-semibold text-tmm-dark mt-4">${taller.precio.toLocaleString('es-CL')}</p>
            </div>
            <Link to={`/inscribir/${taller.id}`} className="mt-6 block text-center w-full bg-tmm-pink hover:opacity-90 text-white font-bold py-3 px-4 rounded-lg transition-all duration-300">
    Ver Detalles e Inscribirme
</Link>
          </div>
        ))}
      </div>
    </div>
  );
}
export default Catalogo;