import { dashboardService } from '../services/dashboardService.js';

export const dashboardController = {
  getResumen: async (req, res) => {
    try {
      res.json(await dashboardService.getResumen());
    } catch (error) {
      console.error('Error cargando dashboard:', error);
      res.status(500).json({ message: 'Error al cargar datos del dashboard' });
    }
  },
};
