import { Router } from 'express';
import {
  getChallans,
  getChallanById,
  createChallan,
  updateChallan,
  confirmChallan,
  cancelChallan,
} from '../controllers/challan.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createChallanSchema,
  updateChallanSchema,
  getChallanQuerySchema,
} from '../validators/challan.validator';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', validate(getChallanQuerySchema), getChallans);
router.get('/:id', getChallanById);

router.post(
  '/',
  authorize(Role.ADMIN, Role.SALES),
  validate(createChallanSchema),
  createChallan
);

router.put(
  '/:id',
  authorize(Role.ADMIN, Role.SALES),
  validate(updateChallanSchema),
  updateChallan
);

router.post(
  '/:id/confirm',
  authorize(Role.ADMIN, Role.SALES, Role.WAREHOUSE),
  confirmChallan
);

router.post(
  '/:id/cancel',
  authorize(Role.ADMIN, Role.SALES),
  cancelChallan
);

export default router;
