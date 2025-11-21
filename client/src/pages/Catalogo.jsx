import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
    Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription
} from '@/components/ui/card';

function Catalogo() {
  const [talleres, setTalleres] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:5000/api/talleres/activos')
      .then(response => {
        setTalleres(response.data);
        setCargando(false);
      })
      .catch(error => {
        console.error("Error al cargar talleres:", error);
        setCargando(false);
      });
  }, []);

  return (
    <div className="bg-background text-foreground min-h-screen p-8 md:p-12">
      <div className="max-w-6xl mx-auto">
        
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Todos Nuestros Talleres
          </h1>
          <p className="text-lg md:text-xl text-foreground/80 max-w-2xl mx-auto">
            Encuentra la próxima experiencia de bienestar para ti.
          </p>
        </div>

        {cargando ? (
            <p className="text-center">Cargando talleres...</p>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {talleres.map(taller => {
                    // CÁLCULO DE CUPOS
                    const cuposDisponibles = (taller.cupos_totales || 10) - (taller.cupos_inscritos || 0);
                    const agotado = cuposDisponibles <= 0;

                    return (
                        <Card key={taller.id} className="flex flex-col justify-between overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300">
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-2xl">{taller.nombre}</CardTitle>
                                    {/* ETIQUETA DE CUPOS (MODIFICADA) */}
                                    {!agotado ? (
                                        <span className="bg-green-100 text-green-700 text-xs font-bold px-2 py-1 rounded-full border border-green-200 whitespace-nowrap">
                                            ¡Cupos disponibles! {/* <-- CAMBIO AQUÍ */}
                                        </span>
                                    ) : (
                                        <span className="bg-red-100 text-red-700 text-xs font-bold px-2 py-1 rounded-full border border-red-200 whitespace-nowrap">
                                            Agotado
                                        </span>
                                    )}
                                </div>
                                <CardDescription>
                                    {taller.fecha ? new Date(taller.fecha).toLocaleDateString('es-CL', { month: 'long', day: 'numeric' }) : 'Próximamente'}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="relative">
                                    <img 
                                        src={taller.imageUrl ? `http://localhost:5000${taller.imageUrl}` : '/placeholder.png'} 
                                        alt={taller.nombre} 
                                        className={`w-full h-48 object-cover rounded-md mb-4 ${agotado ? 'grayscale opacity-70' : ''}`} 
                                    />
                                    {agotado && (
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <span className="bg-black/70 text-white font-bold px-4 py-2 rounded text-lg">AGOTADO</span>
                                        </div>
                                    )}
                                </div>
                                <p className="text-2xl font-bold mt-4">${taller.precio ? taller.precio.toLocaleString('es-CL') : 'N/A'}</p>
                            </CardContent>
                            <CardFooter className="flex flex-col gap-2">
                                {agotado ? (
                                    <Button disabled className="w-full bg-gray-300 cursor-not-allowed text-gray-500">
                                        Sin Cupos
                                    </Button>
                                ) : (
                                    <Button asChild className="w-full">
                                        <Link to={`/inscribir/${taller.id}`}>
                                            Inscribirme Ahora
                                        </Link>
                                    </Button>
                                )}
                                <Button asChild variant="secondary" className="w-full">
                                    <Link to={`/inscribir/${taller.id}`}>Ver Detalles</Link>
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </div>
        )}
        
        {!cargando && talleres.length === 0 && (
            <p className="text-center text-lg text-foreground/70">
                No hay talleres activos en este momento.
            </p>
        )}
      </div>
    </div>
  );
}

export default Catalogo;