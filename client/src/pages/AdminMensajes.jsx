import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, AlertTriangle } from 'lucide-react';

const AdminMensajes = () => {
    const [mensajes, setMensajes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchMensajes = async () => {
            try {
                const token = localStorage.getItem('tmm_token');
                const response = await axios.get('http://localhost:5000/api/mensajes-contacto', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setMensajes(response.data);
            } catch (err) {
                setError('No se pudieron cargar los mensajes. ' + (err.response?.data?.message || ''));
            } finally {
                setLoading(false);
            }
        };
        fetchMensajes();
    }, []);

    if (loading) {
        return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin" size={48} /></div>;
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="bg-red-100 text-red-800 p-4 rounded-md flex items-center gap-3">
                    <AlertTriangle size={24} />
                    {error}
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8">
            <Card>
                <CardHeader>
                    <CardTitle>Mensajes de Contacto</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Nombre</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Teléfono</TableHead>
                                <TableHead>Mensaje</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {mensajes.length > 0 ? (
                                mensajes.map((msg) => (
                                    <TableRow key={msg.id}>
                                        <TableCell>{new Date(msg.fecha_creacion).toLocaleString()}</TableCell>
                                        <TableCell>{msg.nombre}</TableCell>
                                        <TableCell>{msg.email}</TableCell>
                                        <TableCell>{msg.telefono || '-'}</TableCell>
                                        <TableCell className="whitespace-pre-wrap">{msg.mensaje}</TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan="5" className="text-center">No hay mensajes.</TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminMensajes;
