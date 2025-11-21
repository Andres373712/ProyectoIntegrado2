import React from 'react';
import { useCart } from '../context/CartContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

function Carrito() {
    const { cart, removeFromCart, updateQuantity, total, clearCart } = useCart();
    const navigate = useNavigate();
    const token = localStorage.getItem('tmm_token');

    const handleCheckout = () => {
        if (!token) {
            alert('Debes iniciar sesión para finalizar la compra.');
            navigate('/login-cliente');
            return;
        }
        
        // Aquí iría la lógica para enviar el pedido al backend
        // Por ahora, simulamos el éxito
        if (window.confirm(`¿Confirmar pedido por un total de $${total.toLocaleString('es-CL')}?`)) {
            alert('¡Pedido recibido! Te contactaremos para el pago.');
            clearCart();
            navigate('/');
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center bg-background p-8 text-center">
                <div className="bg-muted p-6 rounded-full mb-4">
                    <ShoppingBag size={64} className="text-muted-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Tu carrito está vacío</h2>
                <p className="text-muted-foreground mb-8">Parece que aún no has añadido ningún taller o producto.</p>
                <Button asChild size="lg">
                    <Link to="/">Explorar Productos</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen p-4 md:p-12">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-primary mb-8">Tu Carrito de Compras</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Lista de Productos */}
                    <div className="lg:col-span-2 space-y-4">
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

                    {/* Resumen de Pago */}
                    <div className="lg:col-span-1">
                        <Card>
                            <CardContent className="p-6">
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
                                <Button onClick={handleCheckout} className="w-full h-12 text-lg font-bold shadow-md">
                                    Pagar Ahora
                                </Button>
                                <div className="mt-4 text-xs text-center text-muted-foreground">
                                    <p>Pagos seguros y encriptados.</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Carrito;