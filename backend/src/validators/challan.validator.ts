import { z } from 'zod';
import { ChallanStatus } from '@prisma/client';

export const challanItemInputSchema = z.object({
  productId: z.string({ required_error: 'Product ID is required' }).uuid('Invalid product ID'),
  quantity: z.coerce
    .number({ required_error: 'Quantity is required' })
    .int('Quantity must be an integer')
    .positive('Quantity must be greater than zero'),
});

export const createChallanSchema = z.object({
  body: z.object({
    customerId: z.string({ required_error: 'Customer ID is required' }).uuid('Invalid customer ID'),
    notes: z.string().optional(),
    items: z
      .array(challanItemInputSchema)
      .min(1, 'Challan must contain at least one item'),
  }),
});

export const updateChallanSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid challan ID format'),
  }),
  body: z.object({
    customerId: z.string().uuid().optional(),
    notes: z.string().optional(),
    items: z.array(challanItemInputSchema).min(1).optional(),
  }),
});

export const getChallanQuerySchema = z.object({
  query: z.object({
    page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
    limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
    search: z.string().optional(),
    status: z.nativeEnum(ChallanStatus).optional(),
    customerId: z.string().uuid().optional(),
    sortBy: z.string().optional().default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
  }),
});
