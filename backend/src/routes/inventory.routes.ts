import { Router } from 'express';
import {
  getInventorySummary,
  getStockMovements,
  recordStockIn,
  recordStockOut,
} from '../controllers/inventory.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  stockMovementSchema,
  getMovementsQuerySchema,
} from '../validators/product.validator';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/', getInventorySummary);
router.get('/movements', validate(getMovementsQuerySchema), getStockMovements);

router.post(
  '/stock-in',
  authorize(Role.ADMIN, Role.WAREHOUSE),
  validate(stockMovementSchema),
  recordStockIn
);

router.post(
  '/stock-out',
  authorize(Role.ADMIN, Role.WAREHOUSE),
  validate(stockMovementSchema),
  recordStockOut
);

export default router;
