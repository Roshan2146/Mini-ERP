import { Router } from 'express';
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addFollowUp,
  getCustomerFollowUps,
  getAllFollowUps,
} from '../controllers/customer.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import {
  createCustomerSchema,
  updateCustomerSchema,
  getCustomerQuerySchema,
  createFollowUpSchema,
} from '../validators/customer.validator';
import { Role } from '@prisma/client';

const router = Router();

router.use(authenticate);

// CRM Followups
router.get('/crm/all-followups', authorize(Role.ADMIN, Role.SALES, Role.ACCOUNTS), getAllFollowUps);

// Customer CRUD
router.get('/', validate(getCustomerQuerySchema), getCustomers);
router.get('/:id', getCustomerById);

router.post(
  '/',
  authorize(Role.ADMIN, Role.SALES, Role.ACCOUNTS),
  validate(createCustomerSchema),
  createCustomer
);

router.put(
  '/:id',
  authorize(Role.ADMIN, Role.SALES, Role.ACCOUNTS),
  validate(updateCustomerSchema),
  updateCustomer
);

router.delete(
  '/:id',
  authorize(Role.ADMIN, Role.SALES),
  deleteCustomer
);

// Follow-up sub-routes
router.post(
  '/:id/followups',
  authorize(Role.ADMIN, Role.SALES),
  validate(createFollowUpSchema),
  addFollowUp
);

router.get(
  '/:id/followups',
  getCustomerFollowUps
);

export default router;
