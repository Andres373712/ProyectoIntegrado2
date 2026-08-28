import { dashboardService } from '../services/dashboardService.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const dashboardController = {
  getResumen: asyncHandler(async (req, res) => {
    res.json(await dashboardService.getResumen());
  }),
};
