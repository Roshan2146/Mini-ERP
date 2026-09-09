import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from '../controllers/product.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createProductSchema,
  updateProductSchema,
  getProductQuerySchema,
} from '../validators/product.validator';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

router.get('/categories', getCategories);
router.get('/', validate(getProductQuerySchema), getProducts);
router.get('/:id', getProductById);

router.post(
  '/',
  authorize(Role.ADMIN, Role.WAREHOUSE),
  validate(createProductSchema),
  createProduct
);

router.put(
  '/:id',
  authorize(Role.ADMIN, Role.WAREHOUSE),
  validate(updateProductSchema),
  updateProduct
);

router.delete(
  '/:id',
  authorize(Role.ADMIN, Role.WAREHOUSE),
  deleteProduct
);

export default router;
