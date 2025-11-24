import React, { useState } from 'react';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Trash2, Plus, Minus, ShoppingBag, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Carrito() {
    const { cart, removeFromCart, updateQuantity, total, clearCart } = useCart();
    
    // Estados para el formulario de checkout
    const [nombre, setNombre] = useState('');
    const [email, setEmail] = useState('');
    const [telefono, setTelefono] = useState('');
    const [mensaje, setMensaje] = useState('');
    const [exito, setExito] = useState(false);
    const [mostrarCheckout, setMostrarCheckout] = useState(false);

    const handleProcederCheckout = () => {
        setMostrarCheckout(true);
    };

const handleConfirmarPedido = (e) => {
    e.preventDefault();
    setMensaje('');

    // Preparar datos del pedido
    const datosPedido = {
        nombre,
        email,
        telefono,
        productos: cart.map(item => ({
            id: item.id,
            nombre: item.nombre,
            cantidad: item.cantidad,
            precio: item.precio
        })),
        total
    };

    // Enviar pedido al backend
    axios.post('http://localhost:5000/api/pedido', datosPedido)
        .then(response => {
            setExito(true);
            setMensaje(response.data.message);
            clearCart();
            
            // NUEVO: Redirigir automáticamente a MercadoPago después de 2 segundos
            setTimeout(() => {
                window.open('https://www.mercadopago.cl/', '_blank');
                alert('En un sistema real, aquí se abriría tu enlace de pago personalizado de MercadoPago con el monto de $' + total.toLocaleString('es-CL'));
            }, 2000);
        })
        .catch(error => {
            setExito(false);
            setMensaje(error.response?.data?.message || 'Error al procesar el pedido.');
        });
};

    if (cart.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-background p-8 text-center pt-24">
                <div className="bg-muted p-6 rounded-full mb-4">
                    <ShoppingBag size={64} className="text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Tu carrito está vacío</h2>
                <p className="text-muted-foreground mb-8">Parece que aún no has añadido ningún producto.</p>
                <Button asChild size="lg">
                    <Link to="/">Explorar Productos</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen p-4 md:p-12 pt-24">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-primary mb-8">Tu Carrito de Compras</h1>

{exito ? (
    // Pantalla de éxito
    <Card className="shadow-lg border-none">
        <CardContent className="p-12 text-center">
            <div className="bg-green-100 p-6 rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <CheckCircle size={48} className="text-green-600" />
            </div>
            <h2 className="text-3xl font-bold text-green-600 mb-4">¡Pedido Confirmado!</h2>
            <p className="text-lg mb-2">Hola {nombre},</p>
            <p className="text-muted-foreground mb-8">{mensaje}</p>
            
            {/* Simulación de MercadoPago */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <p className="text-sm text-muted-foreground mb-4">
                    Para completar tu compra, procede al pago seguro:
                </p>
                <Button 
                    onClick={() => {
                        // Simular redirección a MercadoPago
                        window.open('https://www.mercadopago.cl/', '_blank');
                        alert('En un sistema real, aquí se abriría tu enlace de pago personalizado de MercadoPago.');
                    }}
                    className="w-full h-14 text-lg font-bold bg-blue-500 hover:bg-blue-600"
                >
                    💳 Pagar con MercadoPago
                </Button>
                <p className="text-xs text-muted-foreground mt-3">
                    Serás redirigido a la pasarela de pago segura
                </p>
            </div>

            <Button asChild size="lg" variant="outline">
                <Link to="/">Volver al Catálogo</Link>
            </Button>
        </CardContent>
    </Card>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Lista de Productos */}
                        <div className="lg:col-span-2 space-y-4">
                            <h2 className="text-xl font-bold mb-4">Productos ({cart.length})</h2>
                            {cart.map((item) => (
                                <Card key={`${item.tipo}-${item.id}`} className="overflow-hidden flex flex-row items-center p-4 gap-4">
                                    {/* Imagen Miniatura */}
                                    <div className="w-20 h-20 flex-shrink-0 rounded-md overflow-hidden bg-muted">
                                        <img 
                                            src={item.imageUrl ? `http://localhost:5000${item.imageUrl}` : '/placeholder.png'} 
                                            alt={item.nombre} 
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-grow">
                                        <h3 className="font-bold text-lg">{item.nombre}</h3>
                                        <p className="text-sm text-muted-foreground capitalize">{item.tipo}</p>
                                        <p className="text-primary font-bold">${item.precio.toLocaleString('es-CL')}</p>
                                    </div>

                                    {/* Controles */}
                                    <div className="flex flex-col items-end gap-2">
                                        <div className="flex items-center border rounded-md">
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.tipo, -1)}
                                                className="p-2 hover:bg-muted transition-colors"
                                                disabled={item.cantidad <= 1}
                                            >
                                                <Minus size={14} />
                                            </button>
                                            <span className="w-8 text-center font-medium text-sm">{item.cantidad}</span>
                                            <button 
                                                onClick={() => updateQuantity(item.id, item.tipo, 1)}
                                                className="p-2 hover:bg-muted transition-colors"
                                                disabled={item.tipo === 'producto' && item.cantidad >= item.stock}
                                            >
                                                <Plus size={14} />
                                            </button>
                                        </div>
                                        <button 
                                            onClick={() => removeFromCart(item.id, item.tipo)}
                                            className="text-xs text-red-500 hover:text-red-700 flex items-center gap-1"
                                        >
                                            <Trash2 size={12} /> Eliminar
                                        </button>
                                    </div>
                                </Card>
                            ))}
                        </div>

                        {/* Panel de Checkout */}
                        <div className="lg:col-span-1">
                            <Card className="shadow-lg border-none sticky top-24">
                                <CardContent className="p-6">
                                    {!mostrarCheckout ? (
                                        // Resumen inicial
                                        <>
                                            <h3 className="text-xl font-bold mb-4">Resumen</h3>
                                            <div className="space-y-2 mb-4 pb-4 border-b">
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Subtotal</span>
                                                    <span>${total.toLocaleString('es-CL')}</span>
                                                </div>
                                                <div className="flex justify-between text-sm">
                                                    <span className="text-muted-foreground">Envío</span>
                                                    <span className="text-green-600 font-medium">Por calcular</span>
                                                </div>
                                            </div>
                                            <div className="flex justify-between items-center mb-6">
                                                <span className="text-lg font-bold">Total</span>
                                                <span className="text-2xl font-bold text-primary">${total.toLocaleString('es-CL')}</span>
                                            </div>
                                            <Button onClick={handleProcederCheckout} className="w-full h-12 text-lg font-bold shadow-md">
                                                Finalizar compra
                                            </Button>
                                        </>
                                    ) : (
                                        // Formulario de checkout
                                        <>
                                            <h3 className="text-xl font-bold mb-4">Finalizar Compra</h3>
                                            <form onSubmit={handleConfirmarPedido} className="space-y-4">
                                                <div>
                                                    <Label htmlFor="nombre">Nombre Completo</Label>
                                                    <Input 
                                                        id="nombre" 
                                                        value={nombre} 
                                                        onChange={e => setNombre(e.target.value)} 
                                                        required 
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="email">Email</Label>
                                                    <Input 
                                                        id="email" 
                                                        type="email" 
                                                        value={email} 
                                                        onChange={e => setEmail(e.target.value)} 
                                                        required 
                                                    />
                                                </div>
                                                <div>
                                                    <Label htmlFor="telefono">Teléfono (WhatsApp)</Label>
                                                    <Input 
                                                        id="telefono" 
                                                        type="tel" 
                                                        value={telefono} 
                                                        onChange={e => setTelefono(e.target.value)} 
                                                        placeholder="+56912345678"
                                                        required 
                                                    />
                                                </div>
                                                
                                                <div className="border-t pt-4 mt-4">
                                                    <div className="flex justify-between items-center mb-4">
                                                        <span className="font-bold">Total a pagar:</span>
                                                        <span className="text-2xl font-bold text-primary">${total.toLocaleString('es-CL')}</span>
                                                    </div>
                                                </div>

                                                {mensaje && !exito && (
                                                    <p className="text-red-500 text-sm text-center">{mensaje}</p>
                                                )}

                                                <Button type="submit" className="w-full h-12 text-lg font-bold shadow-md">
                                                    Proceder al pago
                                                </Button>
                                                <Button 
                                                    type="button" 
                                                    variant="outline" 
                                                    className="w-full" 
                                                    onClick={() => setMostrarCheckout(false)}
                                                >
                                                    Volver
                                                </Button>
                                            </form>
                                        </>
                                    )}
                                    
                                    <div className="mt-4 text-xs text-center text-muted-foreground">
                                        <p>Te contactaremos para coordinar el pago y envío.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Carrito;