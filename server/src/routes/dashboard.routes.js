import { Router } from 'express';
import { dashboardController } from '../controllers/dashboardController.js';
import { protegerRutas, esAdmin } from '../middlewares/auth.js';

const router = Router();

router.get('/dashboard-data', protegerRutas, esAdmin, dashboardController.getResumen);

export default router;
