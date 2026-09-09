import { Router } from 'express';
import { getUsers, createUser, updateUserStatus } from '../controllers/auth.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createUserSchema, updateUserStatusSchema } from '../validators/auth.validator';
import { Role } from '@prisma/client';

const router = Router();

// All user management routes are restricted to ADMIN
router.use(authenticate);
router.use(authorize(Role.ADMIN));

router.get('/', getUsers);
router.post('/', validate(createUserSchema), createUser);
router.patch('/:id/status', validate(updateUserStatusSchema), updateUserStatus);

export default router;
