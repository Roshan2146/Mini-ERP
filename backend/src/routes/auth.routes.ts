import { Router } from 'express';
import { login, getMe } from '../controllers/auth.controller';
import { validate } from '../middleware/validate.middleware';
import { loginSchema } from '../validators/auth.validator';
import { authenticate, authLimiter } from '../middleware/auth.middleware';

const router = Router();

router.post('/login', authLimiter, validate(loginSchema), login);
router.get('/me', authenticate, getMe);

export default router;
