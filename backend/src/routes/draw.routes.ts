import { Router } from 'express';
import { runDraw, getDrawHistory } from '../controllers/draw.controller';
import { authMiddleware, adminMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/history', authMiddleware, getDrawHistory);
router.post('/run', authMiddleware, adminMiddleware, runDraw);

export default router;
