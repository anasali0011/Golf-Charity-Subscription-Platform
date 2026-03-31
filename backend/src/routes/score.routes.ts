import { Router } from 'express';
import { addScore, getScores } from '../controllers/score.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.post('/', addScore);
router.get('/', getScores);

export default router;
