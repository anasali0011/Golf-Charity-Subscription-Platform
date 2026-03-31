import { Router } from 'express';
import { createSubscription, getSubscriptionStatus, getCharities } from '../controllers/subscription.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);
router.post('/', createSubscription);
router.get('/status', getSubscriptionStatus);
router.get('/charities', getCharities);

export default router;
