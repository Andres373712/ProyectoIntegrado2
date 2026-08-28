import { pedidoService } from '../services/pedidoService.js';
import { HttpError } from '../utils/httpError.js';

export const pedidoController = {
  crear: async (req, res) => {
    try {
      const { pedidoId } = await pedidoService.crearPedido(req.body, req.user);
      res.status(201).json({ message: 'Pedido registrado con éxito', pedidoId });
    } catch (error) {
      if (error instanceof HttpError) {
        return res.status(error.status).json({ message: error.message });
      }
      console.error('Error pedido:', error);
      res.status(500).json({ message: 'Error al registrar el pedido' });
    }
  },
};
